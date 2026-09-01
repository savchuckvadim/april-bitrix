import { readSwrCache } from '@workspace/api';
import { Bitrix } from '@workspace/bitrix';
import {
    PORTAL_CACHE_MAX_AGE_MS,
    PORTAL_CACHE_STALE_AFTER_MS,
    expirePortalCache,
    getPortalCacheKey,
    isPortalSnapshot,
    portalAPI,
} from '@workspace/pbx';
import type { Portal } from '@workspace/pbx';
// type-only: стирается компилятором, ленивость пакета прямого пути не ломает.
import type { EventSalesFlowDto as FlowPackageDto } from '@workspace/event-sales-flow';

import { runExclusiveBatchSession } from '@/modules/app/lib/utills/bitrix-batch-queue';
import type { AppDispatch, AppGetState } from '@/modules/app/model/store';

import { primaryBackendTarget } from '../lib/delivery-targets';
import { loadDirectFlowSettings } from '../lib/direct-capability';
import {
    ensureFreshPortalSnapshot,
    runDirectDelivery,
    runWithCmdBatchHygiene,
    type DirectDeliveryDeps,
    type DirectDeliveryOutcome,
    type DirectPortalCacheEntry,
    type DirectTaskComment,
} from '../lib/direct-delivery';
import type { DirectAttemptMark, OutboxEnvelope } from '../lib/outbox-envelope';
import { readOutboxEnvelope, writeOutboxEnvelope } from '../lib/outbox-store';

/**
 * Thunk прямого исполнения конверта (план А4): собирает ПРОДОВЫЕ deps
 * чистого исполнителя (lib/direct-delivery) и запускает его.
 *
 * Пакет @workspace/event-sales-flow подключается ЛЕНИВО (прецедент —
 * sendNoCall): динамический import живёт внутри deps.execute, то есть чанк
 * пакета грузится только когда допуск по доктрине №1 УЖЕ пройден и маркер
 * не найден — отказы прямого пути пакета не стоят ни байта.
 *
 * В движок доставки thunk НЕ встроен: цель direct-bitrix подключит его
 * следующим шагом (Врезка), здесь — только исполнитель и его контракт.
 */

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

/**
 * Сверка статуса — переиспользуем канал primary-цели (доктрина №1: свой
 * канал прямой путь не заводит). У primary checkStatus есть всегда;
 * пропавший метод — программная ошибка, допуск невозможен.
 */
const primaryCheckStatus: DirectDeliveryDeps['checkStatus'] = (
    operationId,
    domain,
) => {
    const check = primaryBackendTarget.checkStatus;

    if (!check) {
        return Promise.reject(
            new Error(
                'primary-backend без checkStatus — допуск прямого пути невозможен',
            ),
        );
    }

    return check(operationId, domain);
};

/**
 * Комментарии задачи события — типизированный `task.commentitem.getlist`
 * (@workspace/bitrix). ID desc: маркер — свежий комментарий и попадает в
 * первую страницу (метод отдаёт до 50 записей). Ответ без массива —
 * выброс: маркер-проверка обязана быть достоверной.
 */
const readEventTaskComments = async (
    taskId: number,
): Promise<DirectTaskComment[]> => {
    const service = Bitrix.getService();

    if (!service) {
        throw new Error('Bitrix-сервис не инициализирован');
    }
    const response = await service.task.commentGetList({
        TASKID: taskId,
        ORDER: { ID: 'desc' },
    });
    const comments = response?.result;

    if (!Array.isArray(comments)) {
        throw new Error(
            `комментарии задачи ${taskId} не прочитались (ответ без result)`,
        );
    }

    return comments;
};

/** Запись слепка из swr-кэша — с теми же порогами, что у PortalService. */
const readPortalCacheEntry = async (
    domain: string,
): Promise<DirectPortalCacheEntry | null> => {
    const entry = await readSwrCache<Portal>(getPortalCacheKey(domain), {
        staleAfterMs: PORTAL_CACHE_STALE_AFTER_MS,
        maxAgeMs: PORTAL_CACHE_MAX_AGE_MS,
    });

    if (!entry || !isPortalSnapshot(entry.value)) {
        return null;
    }

    return { value: entry.value, savedAt: entry.savedAt };
};

/**
 * Пинок освежения слепка: пометить запись протухшей (слепок моложе суток
 * swr считает свежим и в сеть не пойдёт, а прямому пути нужен порог 2ч) и
 * запустить штатный fetchPortal. Тот резолвится быстро (отдаёт старое),
 * свежая запись доезжает фоновой ревалидацией — её ждёт опрос кэша в
 * ensureFreshPortalSnapshot.
 */
const kickPortalRefresh =
    (domain: string, dispatch: AppDispatch) => async (): Promise<void> => {
        await expirePortalCache(domain);
        const result = await dispatch(
            portalAPI.endpoints.fetchPortal.initiate({ domain }),
        );

        if ('error' in result && result.error) {
            throw new Error(
                `fetchPortal: ${JSON.stringify(result.error).slice(0, 200)}`,
            );
        }
    };

/**
 * Записать в ХРАНИЛИЩЕ отметку «прямой пишущий батч МОГ уйти» — до первой
 * записи в Битрикс. Пишем поверх ТЕКУЩЕЙ записи конверта (её ведёт движок
 * доставки: клейм, попытки), а не поверх экземпляра в памяти — иначе откат
 * состояния затёр бы живой клейм. Хранилища нет (kind `none`) — запись
 * уходит в никуда и это не повод отказывать: конверт всё равно не переживёт
 * вкладку, а внутрисессионный след едет с исходом прямого пути.
 */
const persistDirectAttempt =
    (envelope: OutboxEnvelope) =>
    async (mark: DirectAttemptMark): Promise<void> => {
        const stored = await readOutboxEnvelope(
            envelope.domain,
            envelope.operationId,
        );

        await writeOutboxEnvelope({
            ...(stored ?? envelope),
            directAttempted: mark,
        });
    };

/**
 * Исполнитель пакета: ленивые импорты ядра и браузерных адаптеров, сборка
 * транспорта/портала/логгера, запуск executeEventReportFlow.
 *
 * Каст payload: конверт везёт orval-тип EventSalesFlowDto
 * (@workspace/nest-event-sales-api), пакет ждёт своё зеркало того же
 * wire-контракта POST /flow — оба описывают один JSON, бэк валидирует его
 * одной схемой.
 */
const executeWithPackage =
    (domain: string): DirectDeliveryDeps['execute'] =>
    async ({ payload, settings, portal }) => {
        const [core, adapters] = await Promise.all([
            import('@workspace/event-sales-flow'),
            import('@workspace/event-sales-flow/src/adapters/browser'),
        ]);
        const transport = new adapters.BitrixFlowTransport();
        const portalSource = new adapters.PortalFlowSource(
            portal.snapshot,
            domain,
        );
        const logger = new adapters.ConsoleFlowLogger('DirectDelivery');

        // Гигиена общего cmdBatch: упавший между постановкой и flush'ем
        // use-case не оставляет своих команд (включая маркер) чужому
        // callBatch (см. runWithCmdBatchHygiene).
        return runWithCmdBatchHygiene(transport, () =>
            core.executeEventReportFlow({
                dto: payload as unknown as FlowPackageDto,
                transport,
                portal: portalSource,
                logger,
                settings,
            }),
        );
    };

/**
 * Прямое исполнение конверта в браузере. Возвращает исход исполнителя —
 * маппинг на состояния конверта (executedDirect/partial/failed) делает
 * вызывающий (цель direct-bitrix, следующий шаг).
 *
 * `overrides` — инжекция для тестов: подменённые deps не строятся вовсе
 * (ленивая сборка по ключам), продовый прогон собирает всё сам.
 */
export const deliverEnvelopeDirect =
    (envelope: OutboxEnvelope, overrides: Partial<DirectDeliveryDeps> = {}) =>
    async (
        dispatch: AppDispatch,
        getState: AppGetState,
    ): Promise<DirectDeliveryOutcome> => {
        const domain = envelope.domain;
        // Прогон исполнителя пакета целиком занимает ОБЩУЮ очередь батча:
        // cmdBatch — мутируемое поле синглтона @workspace/bitrix, и чужой
        // callBatch (раскрытая история, контакты), случившийся между
        // постановкой наших команд и нашим flush'ем, унёс бы их себе (или
        // наш flush унёс бы чужие). Очередь — та же, что у runExclusiveBatch,
        // поэтому взаимное исключение получается со всеми её жильцами.
        // Оверрайды тестов идут под очередь тоже: это и есть контракт «весь
        // прогон deps.execute — эксклюзивно».
        const execute = overrides.execute ?? executeWithPackage(domain);
        const deps: DirectDeliveryDeps = {
            checkStatus: overrides.checkStatus ?? primaryCheckStatus,
            readTaskComments:
                overrides.readTaskComments ?? readEventTaskComments,
            ensurePortal:
                overrides.ensurePortal ??
                (() =>
                    ensureFreshPortalSnapshot({
                        readCached: () => readPortalCacheEntry(domain),
                        readState: () => getState().portal.portal,
                        kickRefresh: kickPortalRefresh(domain, dispatch),
                    })),
            loadSettings:
                overrides.loadSettings ??
                (() => loadDirectFlowSettings(domain)),
            execute: input => runExclusiveBatchSession(() => execute(input)),
            markDirectAttempted:
                overrides.markDirectAttempted ?? persistDirectAttempt(envelope),
            now: overrides.now,
            log: overrides.log,
        };
        // Отметка, дошедшая до конверта: неожиданный выброс ПОСЛЕ неё обязан
        // увезти её вызывающему, иначе движок запишет исход из памяти и
        // затрёт след прямой попытки (и дренаж вернёт конверту primary).
        let attempted: DirectAttemptMark | undefined;
        const markDirectAttempted = deps.markDirectAttempted;

        deps.markDirectAttempted = async mark => {
            await markDirectAttempted(mark);
            attempted = mark;
        };

        try {
            return await runDirectDelivery(envelope, deps);
        } catch (error) {
            // Неожиданный выброс (сломанный dep, программная ошибка) —
            // честный провал прямого пути, конверт остаётся дренажу.
            return {
                status: 'failed',
                detail: `прямой путь упал: ${getErrorMessage(error)}`,
                directAttempted: attempted,
            };
        }
    };
