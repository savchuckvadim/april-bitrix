// type-only: стирается компилятором, ленивость пакета прямого пути не ломает.
import type {
    EventReportFlowResult,
    FlowSettings,
    IBatchCommandFailure,
} from '@workspace/event-sales-flow';
import type { Portal } from '@workspace/pbx';

import type { EvFlowDto } from '@/modules/processes/event/model';

import type { FlowStatusCheck } from './delivery-targets';
import {
    hasAcceptedAttempt,
    hasServerRespondedAttempt,
    type DirectAttemptMark,
    type OutboxDeferredStep,
    type OutboxEnvelope,
} from './outbox-envelope';

/**
 * Прямой исполнитель конверта (план А4): отчёт исполняется в браузере
 * пакетом @workspace/event-sales-flow, когда бэк молчит. Здесь — ЧИСТАЯ
 * оркестрация с инжекцией всех коллабораторов (deps): допуск по доктрине
 * №1 → слепок портала с освежением → маркер-проверка → исполнение →
 * разбор исхода. Продовые deps (ленивый импорт пакета, Bitrix-синглтон,
 * primary-checkStatus, swr-кэши) собирает model/DirectDeliveryThunk.
 *
 * Эксклюзивность вкладок даёт движок доставки (Web Locks + lease на всё
 * время target.deliver) — внутри исполнителя повторно не лочимся.
 */

/** Порог свежести слепка портала для прямого исполнения — 2 часа. */
export const DIRECT_PORTAL_STALE_AFTER_MS = 2 * 60 * 60 * 1000;

/** Сколько ждём освежение слепка; не успело — работаем на старом. */
export const DIRECT_PORTAL_REFRESH_TIMEOUT_MS = 5_000;

/** Шаг опроса кэша в ожидании освежения (фоновая ревалидация swr). */
export const DIRECT_PORTAL_REFRESH_POLL_MS = 250;

/** Тег маркера анти-двойного исполнения (доктрина №1). */
export const buildDirectMarkerTag = (operationId: string): string =>
    `[evflow:${operationId}]`;

/**
 * Полный текст комментария-маркера: человекочитаемая строка + тег.
 * Проверка ищет ТОЛЬКО тег — текст можно менять, тег нельзя.
 */
export const buildDirectMarkerText = (operationId: string): string =>
    'Отчёт «Звонков» исполнен напрямую из браузера — основной сервис был ' +
    `недоступен. ${buildDirectMarkerTag(operationId)}`;

/**
 * Комментарий задачи в объёме маркер-проверки — структурное подмножество
 * IBXTaskComment (@workspace/bitrix): читается одно поле POST_MESSAGE.
 */
export interface DirectTaskComment {
    POST_MESSAGE?: unknown;
}

/** Есть ли в комментариях задачи тег этой операции. */
export const hasDirectMarker = (
    comments: readonly DirectTaskComment[],
    operationId: string,
): boolean => {
    const tag = buildDirectMarkerTag(operationId);

    return comments.some(
        comment =>
            typeof comment?.POST_MESSAGE === 'string' &&
            comment.POST_MESSAGE.includes(tag),
    );
};

/**
 * Консервативный хвост досылки для конверта, чьё прямое исполнение УЖЕ
 * состоялось (маркер в задаче есть), но собственный `deferred[]` записать не
 * успело: вкладка умерла между flush пишущего батча и записью исхода.
 *
 * Состав — ровно то, что use-case пакета кладёт в `deferred[]` при
 * ДЕФОЛТНОЙ карте прав (DIRECT_CAPABILITY_DEFAULTS — все опциональные права
 * false), в его же порядке оркестрации: грубый гейт `queueDealFlow` даёт
 * пару pres/xo, KPI-записи, lead-request-sync и im-уведомление о переносе
 * гейтятся флагами, а сайд-flow смартов (ЗПР и «Презентации») уходит
 * досылкой ВСЕГДА. Свидетель состава — пакетная спека
 * `execute-event-report-deferred.spec` («KPI/pres/xo/side-flow (+sync,
 * notify) уходят в deferred в порядке оркестрации»).
 *
 * `addedTaskId` и `createdPresDealId` у side-flow — null СОЗНАТЕЛЬНО: ответ
 * того батча ушёл вместе с вкладкой, восстановить id неоткуда. Шаг без id
 * лучше потерянного шага: серверный исполнитель досылки пересоберёт
 * остальное из payload конверта.
 *
 * Пустой хвост здесь недопустим: applyDirectExecution закрыл бы конверт как
 * `delivered` — терминально, и вся досылка (KPI, pres/xo-движения, элементы
 * смартов) исчезла бы молча.
 */
export const buildDirectDefaultDeferredTail = (): OutboxDeferredStep[] => [
    { kind: 'pres-deals' },
    { kind: 'xo-deals' },
    { kind: 'kpi' },
    { kind: 'lead-request-sync' },
    { kind: 'transfer-notify' },
    {
        kind: 'side-flow',
        flow: 'zpr',
        addedTaskId: null,
        createdPresDealId: null,
    },
    {
        kind: 'side-flow',
        flow: 'pres',
        addedTaskId: null,
        createdPresDealId: null,
    },
];

/**
 * Задача события — адресат маркера. Прямой путь без задачи НЕВОЗМОЖЕН:
 * маркер ставить некуда, а без маркера нет защиты от двойного исполнения
 * (доктрина №1 делает его обязательным) — конверт остаётся ждать primary.
 */
export const resolveMarkerTaskId = (payload: EvFlowDto): number | null => {
    const id = Number(payload.currentTask?.id ?? 0);

    return Number.isFinite(id) && id > 0 ? id : null;
};

// ---------------------------------------------------------------------------
// Слепок портала: освежение с порогом и таймаутом
// ---------------------------------------------------------------------------

/** Запись кэша слепка: значение + момент записи. */
export interface DirectPortalCacheEntry {
    value: Portal;
    savedAt: number;
}

export interface DirectPortalDeps {
    /** Запись слепка из swr-кэша (null — кэша нет/запись не годна). */
    readCached: () => Promise<DirectPortalCacheEntry | null>;
    /** Слепок из Redux (`state.portal.portal`). */
    readState: () => Portal | null;
    /**
     * Пинок обновления: пометить запись протухшей + dispatch fetchPortal.
     * Резолвится быстро (swr отдаёт старое сразу), сам свежий слепок
     * доезжает фоновой ревалидацией — её ждёт опрос кэша ниже.
     */
    kickRefresh: () => Promise<void>;
    now?: () => number;
    wait?: (ms: number) => Promise<void>;
    staleAfterMs?: number;
    timeoutMs?: number;
    pollIntervalMs?: number;
}

/** Слепок, на котором пойдёт исполнение, и его свежесть для конверта. */
export interface DirectPortalSnapshot {
    snapshot: Portal;
    /** Момент записи слепка в кэш; null — возраст неизвестен (без кэша). */
    savedAt: number | null;
    /** Слепок освежён сетью в рамках этого исполнения. */
    refreshed: boolean;
}

const defaultWait = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Слепок портала для прямого исполнения (план А4, шаг «освежение»):
 * - моложе порога (2ч) — берём как есть, сеть не трогаем;
 * - старше порога — пинаем обновление и ждём его до таймаута (~5с),
 *   опрашивая кэш (фоновая ревалидация swr пишет туда свежую запись);
 * - не вышло (сеть, таймаут) — честно работаем на СТАРОМ, его savedAt
 *   уедет в конверт как portalSnapshotAt;
 * - слепка нет нигде и сеть не дала — null: исполнять не на чем.
 * Возраст неизвестен (стор без кэша) — освежение не форсируем: слепок
 * приехал сетью этой сессии.
 */
export const ensureFreshPortalSnapshot = async (
    deps: DirectPortalDeps,
): Promise<DirectPortalSnapshot | null> => {
    const now = deps.now ?? Date.now;
    const wait = deps.wait ?? defaultWait;
    const staleAfterMs = deps.staleAfterMs ?? DIRECT_PORTAL_STALE_AFTER_MS;
    const timeoutMs = deps.timeoutMs ?? DIRECT_PORTAL_REFRESH_TIMEOUT_MS;
    const pollIntervalMs = deps.pollIntervalMs ?? DIRECT_PORTAL_REFRESH_POLL_MS;

    const before = await deps.readCached();
    const stateSnapshot = deps.readState();
    const needsRefresh = before
        ? now() - before.savedAt > staleAfterMs
        : !stateSnapshot;

    if (needsRefresh) {
        try {
            await deps.kickRefresh();
            const deadline = now() + timeoutMs;

            for (;;) {
                const fresh = await deps.readCached();

                if (fresh && (!before || fresh.savedAt > before.savedAt)) {
                    return {
                        snapshot: fresh.value,
                        savedAt: fresh.savedAt,
                        refreshed: true,
                    };
                }
                if (!before) {
                    // Хранилище бывает сквозным (kind none): кэш не появится
                    // никогда, но fetchPortal кладёт слепок в стор.
                    const stateFresh = deps.readState();

                    if (stateFresh) {
                        return {
                            snapshot: stateFresh,
                            savedAt: null,
                            refreshed: true,
                        };
                    }
                }
                if (now() >= deadline) {
                    break;
                }
                await wait(pollIntervalMs);
            }
        } catch {
            // Освежение упало — ниже честно работаем на старом.
        }
    }

    if (before) {
        return {
            snapshot: before.value,
            savedAt: before.savedAt,
            refreshed: false,
        };
    }
    const state = deps.readState();

    return state ? { snapshot: state, savedAt: null, refreshed: false } : null;
};

// ---------------------------------------------------------------------------
// Исполнение конверта
// ---------------------------------------------------------------------------

/**
 * Почему прямое исполнение не состоялось (конверт НЕ тронут — остаётся
 * ждать primary/дренаж):
 * - `accepted-attempt`  — в attempts есть accepted: бэк уже видел операцию,
 *                         прямой путь запрещён навсегда (доктрина №1);
 * - `server-responded`  — по конверту есть попытка с HTTP-ОТВЕТОМ (в том
 *                         числе 5xx): сервер был достижим, запрос мог
 *                         долететь, а job ставится ДО исполнения — flow
 *                         дожмёт воркер, прямое исполнение стало бы вторым;
 * - `backend-alive`     — GET /flow/status ОТВЕТИЛ (status | not-found):
 *                         бэк жив, конверт обязан ехать через primary;
 * - `no-marker-task`    — в payload нет задачи события: маркер ставить
 *                         некуда, без него защиты от дубля нет;
 * - `no-portal`         — слепка портала нет ниоткуда: исполнять не на чем;
 * - `marker-unverified` — комментарии задачи не прочитались: проверка
 *                         маркера невозможна, исполнять вслепую нельзя;
 * - `attempt-unrecorded` — отметку «батч мог уйти» записать не удалось:
 *                         писать в Битрикс, не имея следа попытки, нельзя —
 *                         оживший бэк получил бы исходный payload.
 */
export type DirectDeliveryRefusalReason =
    | 'accepted-attempt'
    | 'server-responded'
    | 'backend-alive'
    | 'no-marker-task'
    | 'no-portal'
    | 'marker-unverified'
    | 'attempt-unrecorded';

/**
 * Итог прямого исполнения. Маппинг на состояния конверта делает следующий
 * шаг (интеграция в цель direct-bitrix):
 * - `executed`         — ядро исполнено, хвост в deferred[]; конверт →
 *                        executedDirect (+partial, пока хвост не дослан);
 * - `duplicate-marker` — маркер найден: пишущий батч этой операции уже
 *                        уходил РАНЬШЕ, повторного исполнения нет; конверт
 *                        считается исполненным напрямую, хвост deferred —
 *                        из самого конверта (что успело записаться);
 * - `refused`          — допуск не пройден, конверт не тронут;
 * - `incomplete`       — пишущий батч УШЁЛ (маркер записан), но команды
 *                        обязательной части подтверждения не получили:
 *                        повторить нечем, отдать бэку нельзя — конверт
 *                        закрывается видимым провалом с составом упавших
 *                        команд (см. applyDirectIncomplete);
 * - `failed`           — до отправки пишущего батча дело не дошло либо она
 *                        сама упала (читающий батч, сеть, сломанный резолв):
 *                        конверт остаётся failed-ретраебельным для дренажа,
 *                        НЕ полу-исполненным «delivered»; исполнился ли
 *                        батч, рассудит маркер-проверка следующей попытки.
 */
export type DirectDeliveryOutcome =
    | {
          status: 'executed';
          executedDirect: true;
          deferred: OutboxDeferredStep[];
          addedTaskId: number | null;
          portalSnapshotAt: number | null;
      }
    | {
          status: 'duplicate-marker';
          executedDirect: true;
          deferred: OutboxDeferredStep[];
      }
    | {
          status: 'refused';
          reason: DirectDeliveryRefusalReason;
          detail?: string;
      }
    | {
          /**
           * Ядро проведено НЕ ЦЕЛИКОМ: батч ушёл, часть обязательных команд
           * не подтверждена. Конверту это терминально (повтор заблокирует
           * маркер, primary запрещён навсегда) — исход обязан быть видимым.
           */
          status: 'incomplete';
          executedDirect: true;
          /** Cmd-ключи неприменившихся обязательных команд — в диагностику. */
          failedCommands: string[];
          detail: string;
          /** Хвост досылки: собран, но своим каналом (А5) уже не поедет. */
          deferred: OutboxDeferredStep[];
          addedTaskId: number | null;
          portalSnapshotAt: number | null;
          directAttempted: DirectAttemptMark;
      }
    | {
          status: 'failed';
          detail: string;
          /**
           * Отметка «пишущий батч МОГ уйти», если провал случился ПОСЛЕ её
           * фиксации. Уезжает в конверт вместе с сетевой попыткой: запись
           * исхода идёт из экземпляра в памяти и иначе затёрла бы отметку,
           * уже лежащую в хранилище, — и дренаж вернул бы конверту primary.
           */
          directAttempted?: DirectAttemptMark;
      };

/** Вход исполнителя пакета — thunk оборачивает ленивые импорты. */
export interface DirectExecuteInput {
    payload: EvFlowDto;
    settings: FlowSettings;
    portal: DirectPortalSnapshot;
}

export interface DirectDeliveryDeps {
    /**
     * Сверка статуса операции — ТА ЖЕ, что у primary-цели
     * (primaryBackendTarget.checkStatus из delivery-targets): свой канал
     * прямой путь не заводит.
     */
    checkStatus: (
        operationId: string,
        domain: string,
    ) => Promise<FlowStatusCheck>;
    /**
     * Комментарии задачи события (типизированный
     * `task.commentitem.getlist` из @workspace/bitrix, страница 50,
     * ID desc — маркер свежий и попадает в первую). Не прочитались —
     * бросает: проверка маркера обязательна.
     */
    readTaskComments: (taskId: number) => Promise<DirectTaskComment[]>;
    /** Слепок портала с освежением (ensureFreshPortalSnapshot). */
    ensurePortal: () => Promise<DirectPortalSnapshot | null>;
    /** FlowSettings по карте прав (loadDirectFlowSettings). */
    loadSettings: () => Promise<FlowSettings>;
    /** Исполнитель пакета (ленивые импорты — в thunk'е). */
    execute: (input: DirectExecuteInput) => Promise<EventReportFlowResult>;
    /**
     * Зафиксировать в конверте отметку «прямой пишущий батч МОГ уйти»
     * (DirectAttemptMark). Вызывается AWAITED ровно перед `execute` —
     * раньше первой записи в Битрикс. Бросок = отказ прямого пути
     * (`attempt-unrecorded`): исполнять, не оставив следа, нельзя.
     */
    markDirectAttempted: (mark: DirectAttemptMark) => Promise<void>;
    now?: () => number;
    log?: (message: string) => void;
}

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

const describeFailures = (failures: IBatchCommandFailure[]): string =>
    failures
        .map(failure => `${failure.cmd}: ${failure.error?.error ?? '?'}`)
        .join('; ');

/**
 * Гигиена общего cmdBatch вокруг исполнителя (образец — снапшот-дифф
 * группового буфера и runExclusiveBatch): use-case, упавший МЕЖДУ
 * постановкой команд (включая маркер) и flush'ем, оставил бы свои ключи в
 * очереди СИНГЛТОНА @workspace/bitrix — их унёс бы первый же чужой
 * callBatch: двойное исполнение плюс ложный duplicate-marker для этой
 * операции навсегда. На падении вычищаются ТОЛЬКО ключи, появившиеся за
 * время прогона; чужие (в т.ч. добавленные параллельной фичей) не
 * трогаются. Успех ничего не чистит — flush уже опустошил очередь сам.
 */
export const runWithCmdBatchHygiene = async <T>(
    transport: { getCmdBatch?: () => Record<string, unknown> },
    run: () => Promise<T>,
): Promise<T> => {
    const read =
        typeof transport.getCmdBatch === 'function'
            ? () => transport.getCmdBatch!()
            : null;
    const before = new Set(Object.keys(read?.() ?? {}));

    try {
        return await run();
    } catch (error) {
        const alive = read?.();

        if (alive) {
            for (const key of Object.keys(alive)) {
                if (!before.has(key)) {
                    delete alive[key];
                }
            }
        }
        throw error;
    }
};

/**
 * Прямое исполнение одного конверта. Порядок — по плану А4:
 * допуск (доктрина №1) → маркер-проверка → слепок портала (порог 2ч,
 * таймаут ~5с) → отметка «батч мог уйти» → исполнение пакетом (маркер
 * первой командой пишущего батча ставит сам use-case по
 * settings.directMarker) → разбор исхода.
 *
 * Допуск: прямой путь разрешён ТОЛЬКО когда в attempts нет ни одной
 * accepted-попытки И контрольный GET /flow/status недоступен СЕТЕВО.
 * Ответивший статус — даже not-found — значит «бэк жив»: конверт остаётся
 * ждать primary (после часа жизни статуса not-found неотличим от «POST не
 * долетел», но живому бэку и доставлять должен primary).
 *
 * ИСКЛЮЧЕНИЕ — конверт с отметкой `directAttempted`: его пишущий батч уже
 * МОГ уйти в Битрикс, поэтому primary ему запрещён навсегда (исходный
 * payload = второе полное исполнение), и живой бэк его судьбу не решает.
 * Такой конверт судит ТОЛЬКО маркер: найден — повтора нет (duplicate),
 * не найден — батч не ушёл, прямой путь можно повторить; не прочитались
 * комментарии — конверт ждёт, но на primary всё равно не едет.
 */
export const runDirectDelivery = async (
    envelope: OutboxEnvelope,
    deps: DirectDeliveryDeps,
): Promise<DirectDeliveryOutcome> => {
    const log =
        deps.log ??
        ((message: string) => console.log(`[event-outbox][direct] ${message}`));
    const now = deps.now ?? Date.now;
    const attempted = envelope.directAttempted;

    // Допуск №1: accepted в истории — бэк уже принимал эту операцию.
    if (hasAcceptedAttempt(envelope)) {
        return { status: 'refused', reason: 'accepted-attempt' };
    }

    // Допуск №1б: сервер ОТВЕЧАЛ (в том числе 5xx) — запрос мог долететь, а
    // job ставится ДО исполнения flow: его дожмёт воркер. Конверт с
    // отметкой прямой попытки этот допуск не проходит (см. докблок): живой
    // бэк ему не адресат, его судьбу решает только маркер.
    if (!attempted && hasServerRespondedAttempt(envelope)) {
        return { status: 'refused', reason: 'server-responded' };
    }

    // Маркеру нужна задача события. У конверта с отметкой адресат уже
    // зафиксирован — берём его: payload не менялся, но отметка честнее.
    const markerTaskId =
        attempted?.markerTaskId ?? resolveMarkerTaskId(envelope.payload);

    if (!markerTaskId) {
        return { status: 'refused', reason: 'no-marker-task' };
    }

    // Допуск №2: статус должен быть недоступен СЕТЕВО. Конверт с отметкой
    // этот допуск не проходит вовсе — см. докблок: живой бэк ему не адресат.
    if (!attempted) {
        const statusCheck = await deps.checkStatus(
            envelope.operationId,
            envelope.domain,
        );

        if (statusCheck.kind !== 'unavailable') {
            return {
                status: 'refused',
                reason: 'backend-alive',
                detail: `status: ${statusCheck.kind}`,
            };
        }
    }

    // Маркер-проверка: пишущий батч этой операции уже уходил? Идёт ДО
    // слепка портала — дубликату исполнять нечего, и освежать слепок ради
    // отказа незачем (а конверту с отметкой отсутствие слепка не повод
    // остаться без сверки маркера).
    let comments: DirectTaskComment[];

    try {
        comments = await deps.readTaskComments(markerTaskId);
    } catch (error) {
        return {
            status: 'refused',
            reason: 'marker-unverified',
            detail: getErrorMessage(error),
        };
    }
    if (hasDirectMarker(comments, envelope.operationId)) {
        // Дубликат: исполнено напрямую РАНЬШЕ (вкладка умерла после
        // отправки батча). Хвост deferred — из конверта; конверт, не
        // доживший до записи хвоста, получает КОНСЕРВАТИВНЫЙ набор шагов
        // дефолтной карты прав (см. buildDirectDefaultDeferredTail):
        // пустой хвост закрыл бы конверт терминальным `delivered` и
        // потерял бы всю досылку молча.
        const deferred = envelope.deferred?.length
            ? envelope.deferred
            : buildDirectDefaultDeferredTail();

        log(
            `маркер ${buildDirectMarkerTag(envelope.operationId)} уже в задаче ${markerTaskId} — duplicate-marker, повторного исполнения нет` +
                (envelope.deferred?.length
                    ? ''
                    : '; хвост конверта пуст — досылке отдан консервативный набор шагов'),
        );

        return {
            status: 'duplicate-marker',
            executedDirect: true,
            deferred,
        };
    }

    // Слепок портала: освежить по порогу, не вышло — работаем на старом.
    const portal = await deps.ensurePortal();

    if (!portal) {
        return { status: 'refused', reason: 'no-portal' };
    }

    // Настройки: карта прав (все опциональные права выключены) + маркер.
    const settingsBase = await deps.loadSettings();
    const settings: FlowSettings = {
        ...settingsBase,
        directMarker: {
            taskId: markerTaskId,
            text: buildDirectMarkerText(envelope.operationId),
            authorId: envelope.userId,
        },
    };

    // Отметка «пишущий батч МОГ уйти» — AWAITED ДО первой записи в Битрикс.
    // Дальше любой сбой (потеря ответа, смерть вкладки) оставляет конверт со
    // следом прямого пути: primary ему запрещён, исход выяснит маркер.
    const mark: DirectAttemptMark = { at: now(), markerTaskId };

    try {
        await deps.markDirectAttempted(mark);
    } catch (error) {
        return {
            status: 'refused',
            reason: 'attempt-unrecorded',
            detail: getErrorMessage(error),
        };
    }

    let result: EventReportFlowResult;

    try {
        result = await deps.execute({
            payload: envelope.payload,
            settings,
            portal,
        });
    } catch (error) {
        // Упавший читающий батч, сеть на пишущем flush, сломанный резолв —
        // прямой путь провален; исполнился ли пишущий батч, выяснит
        // маркер-проверка следующей попытки (отметка едет с исходом).
        return {
            status: 'failed',
            detail: `прямое исполнение упало: ${getErrorMessage(error)}`,
            directAttempted: mark,
        };
    }

    // Разбор ошибок команд (halt=0): и настоящий result_error dev-режима, и
    // синтетический NO_RESPONSE фрейма — во фрейме b24jssdk выбрасывает
    // упавшие команды из ответа, и «команда без ответа» это ЕДИНСТВЕННЫЙ
    // след её падения (адаптер транспорта подставляет его сам). Ошибки
    // опциональных групп с deferred-представлением use-case уже
    // конвертировал (deferredErrors); всё остальное — провал обязательной
    // части.
    const converted = new Set(result.deferredErrors.map(f => f.cmd));
    const fatal = result.errors.filter(f => !converted.has(f.cmd));

    if (fatal.length > 0) {
        // Батч УШЁЛ (маркер — его первая команда), значит повторить нечем:
        // маркер-проверка следующей попытки даст duplicate-marker, а бэку
        // исходный payload слать нельзя. Исход терминальный и видимый —
        // конверт не должен выглядеть исполненным.
        const failedCommands = fatal.map(failure => failure.cmd);
        const detail = `обязательные команды пишущего батча не применились: ${describeFailures(fatal)}`;

        log(`${detail}; конверт закрыт как неполно исполненный`);

        return {
            status: 'incomplete',
            executedDirect: true,
            failedCommands,
            detail,
            deferred: result.deferred,
            addedTaskId: result.addedTaskId,
            portalSnapshotAt: portal.savedAt,
            directAttempted: mark,
        };
    }
    if (result.deferredErrors.length > 0) {
        log(
            `тонкий раскрой: в досылку конвертированы ${describeFailures(result.deferredErrors)}`,
        );
    }

    return {
        status: 'executed',
        executedDirect: true,
        deferred: result.deferred,
        addedTaskId: result.addedTaskId,
        portalSnapshotAt: portal.savedAt,
    };
};
