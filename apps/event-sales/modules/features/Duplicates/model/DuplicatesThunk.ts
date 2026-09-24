import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { selectMyDepartmentRole } from '@/modules/features/Departament/model/selectors';
import { DuplicatesHelper } from '../lib/api/duplicates-helper';
import { resolveDuplicateTarget } from '../lib/duplicate-context';
import { toErrorText } from '../lib/error-text.util';
import { resolveJoinTarget } from '../lib/join-to-main.util';
import { duplicatesActions } from './DuplicatesSlice';
import {
    DUPLICATE_SEARCH_LEVEL,
    duplicateKey,
    type DuplicateCandidate,
    type DuplicateEntityType,
    type DuplicateRawSignals,
    type DuplicateSearchLevel,
    type JoinToMainResult,
    type SalesHookOperation,
} from './index';

const helper = new DuplicatesHelper();

interface SearchOptions {
    /** Автопоиск по открытию приложения — ошибки не показываем. */
    isAuto?: boolean;
    /** Игнорировать кэш бэкенда. */
    force?: boolean;
    level?: DuplicateSearchLevel;
    /** Значения из формы ручного поиска. */
    raw?: DuplicateRawSignals;
    /**
     * Явная сущность вместо вычисленной из контекста — ручной поиск по ID
     * компании, когда приложение открыто там, где клиента ещё нет.
     */
    entityType?: DuplicateEntityType;
    entityId?: number;
}

/**
 * Поиск дублей в текущем контексте.
 *
 * От чего искать, решает `resolveDuplicateTarget`: из лида — по лиду, из
 * сделки — по её компании, из сделки без компании — по самой сделке.
 * Сигналы (телефон, email, ИНН) собирает бэкенд: на фронте их попросту нет —
 * `BXCompany` несёт только ID, TITLE и счётчик презентаций.
 */
export const searchDuplicates =
    (options: SearchOptions = {}) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        if (!domain) return;

        const context = resolveDuplicateTarget(getDuplicateContext(state));
        // Явно указанная сущность бьёт контекст: пользователь ввёл ID руками.
        const target = options.entityId
            ? {
                  entityType: options.entityType,
                  entityId: options.entityId,
                  manualOnly: false,
              }
            : context;

        const hasRaw = !!(
            options.raw?.inns?.length ||
            options.raw?.titles?.length ||
            options.raw?.phones?.length ||
            options.raw?.emails?.length
        );
        // Искать не от чего и руками ничего не ввели — молчим.
        if (target.manualOnly && !hasRaw) return;

        dispatch(duplicatesActions.searchStarted({ isAuto: !!options.isAuto }));
        try {
            const result = await helper.search({
                domain,
                entityType: target.entityType,
                entityId: target.entityId,
                raw: options.raw,
                level: options.level ?? DUPLICATE_SEARCH_LEVEL.NUMBER_1,
                force: options.force,
            });
            dispatch(duplicatesActions.searchSucceeded({ result }));
        } catch (error) {
            dispatch(
                duplicatesActions.searchFailed({ message: toErrorText(error) }),
            );
        }
    };

/**
 * Автопоиск при открытии приложения.
 *
 * Только быстрый уровень и без force: бэкенд отдаст ответ из кэша, если в
 * пределах двух минут по тем же сигналам уже искали. Поэтому проверка «а не
 * появился ли новый дубль» при каждом открытии почти ничего не стоит.
 */
export const autoSearchDuplicates = () => async (dispatch: AppDispatch) => {
    await dispatch(
        searchDuplicates({
            isAuto: true,
            level: DUPLICATE_SEARCH_LEVEL.NUMBER_1,
        }),
    );
};

/** Углублённый поиск по кнопке: реквизиты и подстрочный поиск по названию. */
export const deepSearchDuplicates = () => async (dispatch: AppDispatch) => {
    await dispatch(
        searchDuplicates({
            force: true,
            level: DUPLICATE_SEARCH_LEVEL.NUMBER_2,
        }),
    );
};

/**
 * «Присоединить сюда»: текущая сделка-дубль → в работу кандидата.
 *
 * Хук join-to-main ничего не удаляет: контакты уходят в компанию и
 * основную, лид и задачи — ответственному основной, текущая сделка
 * закрывается стадией «Дубль». Право и цель считает `resolveJoinTarget`,
 * подтверждение — в UI (двухшаговая кнопка), здесь только вызов и ожидание
 * операции. Пропуск на бэке (чужая воронка, основная закрыта) — это ошибка
 * для пользователя: причина в warnings.
 */
export const joinToMain =
    (candidate: DuplicateCandidate) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const domain = state.app.domain;
        if (!domain) return;

        const target = resolveJoinTarget(
            candidate,
            getDuplicateContext(state),
            selectMyDepartmentRole(state).role,
        );
        if (
            !target.allowed ||
            !target.targetType ||
            !target.targetId ||
            !target.dealId
        ) {
            dispatch(
                duplicatesActions.joinFailed({
                    message: target.reason ?? 'Присоединение недоступно',
                }),
            );
            return;
        }

        dispatch(duplicatesActions.joinStarted());
        try {
            const initiator = Number(state.app.bitrix.user?.ID ?? 0);
            const operation = await helper.joinToMain({
                domain,
                dealId: target.dealId,
                targetType: target.targetType,
                targetId: target.targetId,
                closeAsDuplicate: true,
                ...(initiator > 0 ? { initiatorUserId: initiator } : {}),
            });
            const result = (operation.result as JoinToMainResult | null)
                ?.items?.[0];
            if (operation.status === 'failed' || !result) {
                throw new Error(
                    operationError(operation) ??
                        'Операция завершилась без результата',
                );
            }
            if (result.skipped) {
                dispatch(
                    duplicatesActions.joinFailed({
                        message:
                            result.warnings.join('; ') ||
                            'Присоединение пропущено',
                    }),
                );
                return;
            }
            dispatch(duplicatesActions.joinSucceeded({ result }));
        } catch (error) {
            dispatch(
                duplicatesActions.joinFailed({ message: toErrorText(error) }),
            );
        }
    };

/** Текст ошибки операции, если бэк его прислал (поле необязательное). */
const operationError = (operation: SalesHookOperation): string | null =>
    typeof operation.error === 'string' && operation.error.trim()
        ? operation.error
        : null;

/** Детали кандидата: ответственный, его связанные сделки и лиды. */
export const fetchDuplicateDetails =
    (candidate: DuplicateCandidate, includeClosed = false) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const domain = getState().app.domain;
        if (!domain) return;

        dispatch(
            duplicatesActions.detailsOpened({ key: duplicateKey(candidate) }),
        );
        try {
            const details = await helper.getDetails({
                domain,
                entityType: candidate.entityType,
                entityId: candidate.id,
                includeClosed,
            });
            dispatch(duplicatesActions.detailsSucceeded({ details }));
        } catch (error) {
            dispatch(
                duplicatesActions.detailsFailed({
                    message: toErrorText(error),
                }),
            );
        }
    };
