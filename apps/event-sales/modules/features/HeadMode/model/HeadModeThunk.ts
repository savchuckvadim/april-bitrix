import { resolveSwrCache } from '@workspace/api';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';
import { departmentActions } from '@/modules/features/Departament/model/DepartmentSlice';
import { selectAllDepartmentUsers } from '@/modules/features/Departament/model/selectors';
import {
    DEPARTAMENT_STATE_PROP,
    DUSER_ROLE,
} from '@/modules/features/Departament/type/department-type';
import { HeadModeHelper } from '../lib/api/head-mode-helper';
import {
    getSavedHeadModeEnabled,
    saveHeadModeEnabled,
} from '../lib/head-mode-storage';
import { findAssignee, taskResponsibleName } from '../lib/head-mode.util';
import {
    HEAD_PERIMETER_STALE_AFTER_MS,
    type HeadPerimeter,
    getHeadPerimeterCacheKey,
    isHeadPerimeter,
    sameSubordinates,
} from '../lib/head-perimeter-cache';
import { headModeActions } from './HeadModeSlice';
import { selectTaskOwnerId } from './selectors';

const headModeHelper = new HeadModeHelper();

/**
 * Загрузка списка подчинённых. Стартует на буте вместе с отделом —
 * нужен только домен и пользователь. Повторный вызов при готовом списке
 * в сеть не ходит; после ошибки — пробует снова.
 *
 * Список берётся из кэша браузера сразу, свежий приходит в фоне (см.
 * head-perimeter-cache): список дел ждёт подчинённых и не должен ждать
 * сеть на каждом открытии. Фоновое обновление применяется, только если
 * состав изменился: иначе список дел перезапрашивался бы впустую.
 */
export const fetchHeadPerimeter =
    (domain: string, userId: number) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const { status } = getState().headMode;
        if (status === 'loading' || status === 'ready') return;

        const saved = getSavedHeadModeEnabled();
        if (saved !== null) {
            dispatch(headModeActions.setEnabled({ enabled: saved }));
        }
        if (!domain || !userId) {
            dispatch(headModeActions.setFailed());
            return;
        }

        dispatch(headModeActions.setLoading());
        try {
            const resolved = await resolveSwrCache<HeadPerimeter>({
                key: getHeadPerimeterCacheKey(domain, userId),
                staleAfterMs: HEAD_PERIMETER_STALE_AFTER_MS,
                fetcher: async () => {
                    const currentUser = await headModeHelper.getCurrentUser(
                        domain,
                        userId,
                    );
                    return { subordinateIds: currentUser.subordinateIds ?? [] };
                },
                validate: isHeadPerimeter,
                onUpdate: fresh => {
                    const current = getState().headMode.subordinateIds;
                    if (sameSubordinates(current, fresh.subordinateIds)) return;
                    dispatch(
                        headModeActions.setFetched({
                            subordinateIds: fresh.subordinateIds,
                        }),
                    );
                },
            });
            dispatch(
                headModeActions.setFetched({
                    subordinateIds: resolved.value.subordinateIds,
                }),
            );
        } catch (error) {
            console.error('fetchHeadPerimeter error', error);
            dispatch(headModeActions.setFailed());
        }
    };

/** Тумблер режима: выбор запоминается между сессиями. */
export const switchHeadMode =
    (enabled: boolean) => (dispatch: AppDispatch) => {
        saveHeadModeEnabled(enabled);
        dispatch(headModeActions.setEnabled({ enabled }));
    };

/** Записать отчёт и следующее дело на сотрудника (или вернуть на себя). */
const setResponsible =
    (userId: number, fallbackName = '') =>
    (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const me = state.app.bitrix.user;
        if (!me) return;
        const value =
            Number(me.ID) === userId
                ? me
                : findAssignee(
                      userId,
                      selectAllDepartmentUsers(state),
                      fallbackName,
                  );
        const current =
            state.department[DEPARTAMENT_STATE_PROP.PLAN][
                DUSER_ROLE.RESPONSIBLE
            ].current;
        if (Number(current?.ID ?? 0) === Number(value.ID)) return;

        for (const from of [
            DEPARTAMENT_STATE_PROP.PLAN,
            DEPARTAMENT_STATE_PROP.REPORT,
        ] as const) {
            dispatch(
                departmentActions.setCurrentUser({
                    from,
                    role: DUSER_ROLE.RESPONSIBLE,
                    value,
                }),
            );
        }
    };

/**
 * Привести «за кого идёт работа» к открытому делу: дело сотрудника —
 * работа за него; своё дело, новое событие или закрытая форма — за себя.
 *
 * Без возврата на себя выбранный сотрудник переезжал бы на следующее дело:
 * отчёт по собственному клиенту руководителя ушёл бы на чужое имя.
 */
export const syncActingFromTask =
    () => (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        const me = state.app.bitrix.user;
        if (!me) return;
        // Быстрый итог («Продажа» / «Отказ») записывается на ответственного
        // сделки. Пока он не закончен, пересчёт ставит именно его — не
        // пропускает шаг, а возвращает: перечитанный отдел сам пишет
        // ответственным текущего пользователя, и без возврата продажа
        // молча ушла бы на нажавшего кнопку.
        const { kind, ownerId: outcomeOwnerId } = state.quickOutcome;
        if (kind !== null && outcomeOwnerId) {
            dispatch(setResponsible(outcomeOwnerId));
            return;
        }
        const ownerId = selectTaskOwnerId(state);
        dispatch(
            setResponsible(
                ownerId ?? Number(me.ID),
                taskResponsibleName(state.eventTask.current),
            ),
        );
    };

/** Выбор руководителя в плане: кому записать следующее дело. */
export const assignPlanTo = (userId: number) => (dispatch: AppDispatch) => {
    if (!userId) return;
    dispatch(setResponsible(userId));
};
