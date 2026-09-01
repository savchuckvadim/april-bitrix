// type-only: стирается компилятором, ленивость пакета прямого пути не ломает.
import type { DeferredFlowStep } from '@workspace/event-sales-flow';

import type { EvFlowDto } from '@/modules/processes/event/model';

/**
 * Конверт outbox — переживающая вкладку запись об отправке отчёта.
 *
 * Зачем: сегодня payload отправки живёт только в памяти вкладки — закрыл её
 * на середине POST, и отчёт пропал. Конверт пишется в KV-хранилище awaited
 * ДО первого HTTP, а дренаж (OutboxDrainThunk) досылает недоставленное после
 * рестарта. Здесь — тип конверта и ЧИСТАЯ машина его состояний; всё I/O — в
 * outbox-store, вся доставка — в outbox-delivery.
 */

/** Версия схемы конверта. Меняется только при несовместимой правке полей. */
export const OUTBOX_ENVELOPE_VERSION = 1;

/**
 * Пакет прямого пути (@workspace/event-sales-flow) подключается в А4 —
 * до тех пор конверты честно помечены «пакет не подключён».
 */
export const OUTBOX_PACKAGE_VERSION_UNWIRED = 'unwired';

/** Что за отправка лежит в конверте: отчёт или недозвон. */
export const OUTBOX_ENVELOPE_KIND = {
    report: 'report',
    nocall: 'nocall',
} as const;
export type OutboxEnvelopeKind =
    (typeof OUTBOX_ENVELOPE_KIND)[keyof typeof OUTBOX_ENVELOPE_KIND];

/**
 * Жизнь конверта:
 * - `pending`    — записан, доставка ещё не начиналась;
 * - `delivering` — доставка идёт: клейм взят, либо POST принят и исход ждёт
 *                  СУЩЕСТВУЮЩЕГО поллинга статуса (FlowWatch);
 * - `delivered`  — бэкенд подтвердил выполнение (терминальное);
 * - `partial`    — ядро исполнено напрямую (А4), хвост в deferred[] ждёт
 *                  досылки на бэк (эндпоинт А5) — дренаж такие не трогает,
 *                  пока эндпоинта нет, но полоска их видит («ждут досылки»);
 * - `failed`     — отвергнут (4xx/бэкенд) или сеть исчерпала бэкофф; сетевые
 *                  failed дренаж ретраит, отвергнутые ждут ручного повтора.
 */
export const OUTBOX_ENVELOPE_STATE = {
    pending: 'pending',
    delivering: 'delivering',
    delivered: 'delivered',
    partial: 'partial',
    failed: 'failed',
} as const;
export type OutboxEnvelopeState =
    (typeof OUTBOX_ENVELOPE_STATE)[keyof typeof OUTBOX_ENVELOPE_STATE];

/**
 * Исход одной попытки доставки в одну цель:
 * - `accepted`      — 2xx: цель приняла операцию (для primary исход решает
 *                     поллинг статуса, конверт остаётся `delivering`);
 * - `rejected`      — цель ответила отказом (4xx-валидация, бизнес-ошибка):
 *                     payload битый, авторетраи запрещены;
 * - `network-error` — ответа НЕ БЫЛО вовсе (обрыв, таймаут): сервер молчал,
 *                     повтор безопасен (бэк идемпотентен по operationId);
 * - `server-error`  — сервер ОТВЕТИЛ 5xx: повтор через primary безопасен
 *                     (та же идемпотентность), но запрос МОГ долететь —
 *                     бэк пишет статус операции и ставит job ДО исполнения,
 *                     поэтому 504 прокси означает «job уже поставлен».
 *                     Прямой путь по такому конверту запрещён: воркер
 *                     исполнит flow сам, а прямое исполнение стало бы
 *                     вторым;
 * - `unavailable`   — цель сейчас не работает (или прямой путь отказал в
 *                     допуске): попытка не записывается, цель пропускается;
 * - `executed-direct` — А4: прямой исполнитель выполнил ядро отчёта в
 *                     Битриксе сам; конверт закрывается applyDirectExecution
 *                     (delivered без хвоста, partial — с deferred[]);
 * - `direct-incomplete` — А4: пишущий батч ушёл, но команды ОБЯЗАТЕЛЬНОЙ
 *                     части не применились. Повторить нельзя (маркер
 *                     заблокирует), отдать бэку нельзя (двойное
 *                     исполнение) — конверт закрывается
 *                     applyDirectIncomplete: `failed` без авторетраев, с
 *                     составом неприменившихся команд.
 */
export const OUTBOX_DELIVERY_OUTCOME = {
    accepted: 'accepted',
    rejected: 'rejected',
    networkError: 'network-error',
    serverError: 'server-error',
    unavailable: 'unavailable',
    executedDirect: 'executed-direct',
    directIncomplete: 'direct-incomplete',
} as const;
export type OutboxDeliveryOutcome =
    (typeof OUTBOX_DELIVERY_OUTCOME)[keyof typeof OUTBOX_DELIVERY_OUTCOME];

/** Запись о попытке доставки — след для дренажа и диагностики. */
export interface OutboxAttempt {
    /** Куда доставляли (id из реестра delivery-targets). */
    targetId: string;
    /** Когда (Date.now). */
    at: number;
    outcome: OutboxDeliveryOutcome;
    /** Человекочитаемая деталь: текст ошибки, HTTP-статус. */
    detail?: string;
}

/**
 * Аренда конверта вкладкой: фолбэк эксклюзивности там, где нет Web Locks,
 * и маркер живости для дренажа (вкладка умерла — lease протух, конверт
 * можно перехватывать). Продлевается клеймом на каждой попытке.
 */
export interface OutboxLease {
    /** Идентификатор вкладки (на сессию, см. outbox-lock). */
    tabId: string;
    /** До какого момента аренда действительна (Date.now + TTL). */
    until: number;
}

/**
 * Отметка «прямой пишущий батч МОГ уйти в Битрикс» (А4, доктрина №1).
 *
 * Пишется в конверт AWAITED ДО первого обращения прямого исполнителя к
 * Битриксу — раньше, чем маркер-комментарий физически уходит. Без неё любой
 * сбой ПОСЛЕ отправки батча (потеря ответа, смерть вкладки между flush и
 * записью исхода) оставлял конверт обычным ретраебельным `failed` либо
 * вечным `delivering` БЕЗ единого следа прямого исполнения — и оживший бэк
 * получал ИСХОДНЫЙ payload, исполняя отчёт второй раз целиком.
 *
 * Следствия отметки: primary-backend такому конверту ЗАПРЕЩЁН навсегда
 * (см. isPrimaryForbidden в delivery-targets), а его судьбу решает
 * маркер-проверка прямого пути: маркер в задаче найден — батч ушёл, повтора
 * нет; не найден — батч не ушёл, прямой путь можно повторить.
 */
export interface DirectAttemptMark {
    /** Момент фиксации (Date.now) — до обращения к Битриксу. */
    at: number;
    /** Задача события, куда прямой путь ставит маркер и где его ищет. */
    markerTaskId: number;
}

/**
 * Отложенный СЕМАНТИЧЕСКИЙ шаг прямого исполнения (А4): что досылать на
 * бэкенд, когда он оживёт. Данные не дублируются — сервер пересоберёт их из
 * payload конверта; серверные kind'ы идемпотентны сами (план А4).
 *
 * Тип — ПАКЕТНЫЙ DeferredFlowStep (@workspace/event-sales-flow): шаги в
 * конверт кладёт исполнитель пакета, и собственный дубль типа разъезжался
 * бы с ним молча (side-flow везёт addedTaskId и createdPresDealId).
 */
export type OutboxDeferredStep = DeferredFlowStep;

/** Конверт отправки. Форма — ровно по плану А3. */
export interface OutboxEnvelope {
    /** Версия схемы. Незнакомую версию не исполняем и не портим (см. store). */
    v: number;
    /** Идентификатор операции — он же ключ идемпотентности бэкенда. */
    operationId: string;
    /** Домен портала: конверты соседних порталов не смешиваются. */
    domain: string;
    /** Кто отправлял — пригодится прямому пути (А4) и диагностике. */
    userId: number;
    kind: OutboxEnvelopeKind;
    /** Полный payload POST /event-sales/flow — конверт самодостаточен. */
    payload: EvFlowDto;
    state: OutboxEnvelopeState;
    attempts: OutboxAttempt[];
    /** Раньше этого момента дренаж конверт не ретраит. null — ждать нечего. */
    nextAttemptAt: number | null;
    lease?: OutboxLease;
    /**
     * Прямой пишущий батч МОГ уйти в Битрикс (А4): отметка ставится ДО
     * обращения к нему и переживает любой сбой. Есть отметка — primary
     * запрещён, исход выясняет маркер-проверка. Старые конверты поля не
     * имеют и ведут себя как раньше.
     */
    directAttempted?: DirectAttemptMark;
    /** Ядро исполнено напрямую (А4) — бэкенду слать только deferred. */
    executedDirect?: boolean;
    /**
     * Cmd-ключи команд ОБЯЗАТЕЛЬНОЙ части, которые прямой путь отправил, но
     * подтверждения по ним не получил (А4, MAJOR-2). Единственный
     * переживающий вкладку след «отчёт проведён НЕ ЦЕЛИКОМ»: повторять
     * такой конверт нечем (маркер в задаче заблокирует повтор, бэку слать
     * исходный payload нельзя), поэтому состав важен человеку — по нему
     * видно, что именно проверять в карточке.
     */
    directFailedCommands?: string[];
    deferred?: OutboxDeferredStep[];
    /**
     * Терминальный исход этого конверта УЖЕ посчитан метрикой
     * (`markReportOutcome`, lib/report-outcome.ts).
     *
     * Отметка живёт в конверте, а не в памяти вкладки, потому что считать
     * судьбу отчёта надо РОВНО ОДИН РАЗ, а претендентов на подсчёт много:
     * поллинг FlowWatch, сверка статуса в дренаже, соседняя вкладка, новая
     * сессия после перезагрузки фрейма. Всё это читает конверт из IndexedDB —
     * значит и отметку видит.
     *
     * Повтор кнопкой «Повторить» отметку СБРАСЫВАЕТ (см.
     * mergeRequeuedEnvelope): это новая отправка, её считает
     * `event_sales_send_total`, и без сброса воронка «начато против
     * закончено» перекосилась бы.
     */
    outcomeCounted?: boolean;
    /** Версия пакета прямого пути, собравшего конверт (А3 — не подключён). */
    packageVersion: string;
    /** Свежесть слепка портала на момент прямого исполнения (А4). */
    portalSnapshotAt?: number;
    createdAt: number;
    updatedAt: number;
}

export interface CreateOutboxEnvelopeParams {
    operationId: string;
    domain: string;
    userId: number;
    kind: OutboxEnvelopeKind;
    payload: EvFlowDto;
    packageVersion?: string;
    portalSnapshotAt?: number;
    /** Момент создания — инжектируется тестами. */
    now?: number;
}

/** Свежий конверт: `pending`, без попыток — записывается ДО первого HTTP. */
export const createOutboxEnvelope = (
    params: CreateOutboxEnvelopeParams,
): OutboxEnvelope => {
    const now = params.now ?? Date.now();

    return {
        v: OUTBOX_ENVELOPE_VERSION,
        operationId: params.operationId,
        domain: params.domain,
        userId: params.userId,
        kind: params.kind,
        payload: params.payload,
        state: OUTBOX_ENVELOPE_STATE.pending,
        attempts: [],
        nextAttemptAt: null,
        packageVersion: params.packageVersion ?? OUTBOX_PACKAGE_VERSION_UNWIRED,
        portalSnapshotAt: params.portalSnapshotAt,
        createdAt: now,
        updatedAt: now,
    };
};

/**
 * Разрешённые переходы машины состояний.
 *
 * Любая попытка идёт через `delivering` (клейм), поэтому `pending` умеет
 * только туда. `delivering → delivering` легален: повторный клейм после
 * протухшего lease и повторный accepted. `failed → delivering` — ретрай
 * (сетевой — дренажем, отвергнутый — кнопкой «Повторить»). `failed →
 * delivered` — сверка статуса подтвердила done: flow выполнен, конверт
 * гасится без повторного POST. `delivered` — терминал. `partial`
 * довозится в А4/А5.
 */
export const allowedTransitions: Record<
    OutboxEnvelopeState,
    readonly OutboxEnvelopeState[]
> = {
    [OUTBOX_ENVELOPE_STATE.pending]: [OUTBOX_ENVELOPE_STATE.delivering],
    [OUTBOX_ENVELOPE_STATE.delivering]: [
        OUTBOX_ENVELOPE_STATE.delivering,
        OUTBOX_ENVELOPE_STATE.delivered,
        OUTBOX_ENVELOPE_STATE.partial,
        OUTBOX_ENVELOPE_STATE.failed,
    ],
    [OUTBOX_ENVELOPE_STATE.partial]: [
        OUTBOX_ENVELOPE_STATE.delivered,
        OUTBOX_ENVELOPE_STATE.failed,
    ],
    [OUTBOX_ENVELOPE_STATE.delivered]: [],
    [OUTBOX_ENVELOPE_STATE.failed]: [
        OUTBOX_ENVELOPE_STATE.delivering,
        OUTBOX_ENVELOPE_STATE.delivered,
    ],
};

/**
 * Тотальна по `from`: state вне enum (порченая запись — shape-гард стора
 * пропускает любую строку) даёт false, а не TypeError. Падение здесь срывало
 * бы markDelivered/markFailed прямо в done-ветке поллинга — до onDone.
 */
export const canTransition = (
    from: OutboxEnvelopeState,
    to: OutboxEnvelopeState,
): boolean => allowedTransitions[from]?.includes(to) ?? false;

/**
 * Чистый переход состояния. Нелегальный переход — программная ошибка
 * вызывающего, поэтому бросаем: гонки должны гаситься проверкой
 * `canTransition` ДО вызова (так делают markDelivered/markFailed).
 */
export const transitionEnvelope = (
    envelope: OutboxEnvelope,
    to: OutboxEnvelopeState,
    now: number,
): OutboxEnvelope => {
    if (!canTransition(envelope.state, to)) {
        throw new Error(
            `[event-outbox] запрещённый переход ${envelope.state} → ${to} (операция ${envelope.operationId})`,
        );
    }

    return { ...envelope, state: to, updatedAt: now };
};

/**
 * Применить исход попытки доставки: запись в attempts + переход состояния.
 *
 * `accepted` оставляет `delivering` — подтверждение отдаст существующий
 * поллинг статуса (markDelivered/markFailed). `rejected` и `network-error`
 * ведут в `failed`; различает их дренаж по последней попытке
 * (см. isRetryableFailure). `unavailable` сюда не попадает: пропущенная цель
 * попыткой не считается.
 */
export const applyAttempt = (
    envelope: OutboxEnvelope,
    attempt: OutboxAttempt,
    nextAttemptAt: number | null,
): OutboxEnvelope => {
    if (attempt.outcome === OUTBOX_DELIVERY_OUTCOME.unavailable) {
        throw new Error(
            '[event-outbox] unavailable — не попытка: цель пропускается без записи',
        );
    }
    if (attempt.outcome === OUTBOX_DELIVERY_OUTCOME.executedDirect) {
        // Куда перейти, решает хвост deferred (delivered | partial) — этим
        // владеет applyDirectExecution; сюда такой исход попадать не должен.
        throw new Error(
            '[event-outbox] executed-direct применяется applyDirectExecution',
        );
    }
    if (attempt.outcome === OUTBOX_DELIVERY_OUTCOME.directIncomplete) {
        // Неполное прямое исполнение везёт состав упавших команд и запрет
        // авторетраев — этим владеет applyDirectIncomplete.
        throw new Error(
            '[event-outbox] direct-incomplete применяется applyDirectIncomplete',
        );
    }

    const to =
        attempt.outcome === OUTBOX_DELIVERY_OUTCOME.accepted
            ? OUTBOX_ENVELOPE_STATE.delivering
            : OUTBOX_ENVELOPE_STATE.failed;

    return {
        ...transitionEnvelope(envelope, to, attempt.at),
        attempts: [...envelope.attempts, attempt],
        nextAttemptAt,
    };
};

/** Клейм конверта вкладкой перед попыткой: `delivering` + свежий lease. */
export const claimEnvelope = (
    envelope: OutboxEnvelope,
    lease: OutboxLease,
    now: number,
): OutboxEnvelope => ({
    ...transitionEnvelope(envelope, OUTBOX_ENVELOPE_STATE.delivering, now),
    lease,
});

/** Снять аренду — конвертом больше никто активно не занимается. */
export const releaseEnvelopeLease = (
    envelope: OutboxEnvelope,
): OutboxEnvelope => ({ ...envelope, lease: undefined });

/**
 * Конверт ждёт ДОСЫЛКИ ХВОСТА (А5): ядро исполнено браузером напрямую,
 * остались семантические шаги, на которые у менеджера нет прав.
 *
 * Отдельный предикат, а не проверка состояния: `partial` без шагов — уже
 * не работа (гасится как delivered), а неполное исполнение
 * (`direct-incomplete`) хвост в конверте хранит, но досылать его нельзя,
 * пока владелец не решил судьбу отчёта с недоехавшим ядром.
 */
export const isTailPendingEnvelope = (envelope: OutboxEnvelope): boolean =>
    envelope.state === OUTBOX_ENVELOPE_STATE.partial &&
    (envelope.deferred?.length ?? 0) > 0;

/** Итог досылки хвоста (ответ POST /flow/deferred) для applyDeferredTail. */
export interface DeferredTailRecord {
    at: number;
    /** true — сервер исполнил хвост целиком, конверт можно гасить. */
    completed: boolean;
    /**
     * Шаги, ОСТАВШИЕСЯ неисполненными. Конверт хранит ровно их: исполненные
     * повторно не поедут, а упавшие дождутся следующего прогона дренажа.
     */
    pending: OutboxDeferredStep[];
    detail?: string;
}

/**
 * Применить итог досылки хвоста (А5).
 *
 * Хвост доехал целиком — конверт уходит в `delivered` (переход
 * `partial → delivered` легален). Часть шагов упала — конверт остаётся
 * `partial`, но хвост СУЖАЕТСЯ до неисполненного: серверные шаги
 * идемпотентны, однако гонять исполненные по кругу незачем, а полоска иначе
 * вечно считал бы полный хвост.
 *
 * `executedDirect` и история попыток не трогаются: досылка — про хвост, а
 * не про ядро, и след прямого исполнения обязан пережить её (иначе
 * `isPrimaryForbidden` пустил бы исходный payload на бэк).
 */
export const applyDeferredTail = (
    envelope: OutboxEnvelope,
    record: DeferredTailRecord,
): OutboxEnvelope => {
    if (record.completed) {
        return {
            ...transitionEnvelope(
                envelope,
                OUTBOX_ENVELOPE_STATE.delivered,
                record.at,
            ),
            deferred: [],
        };
    }

    return {
        ...envelope,
        deferred: record.pending,
        updatedAt: record.at,
    };
};

/** Запись успешного прямого исполнения (А4) для applyDirectExecution. */
export interface DirectExecutionRecord {
    /** Цель, исполнившая конверт (direct-bitrix из реестра). */
    targetId: string;
    at: number;
    /** Хвост досылки; пуст — исполнено целиком, конверт delivered. */
    deferred: OutboxDeferredStep[];
    /**
     * Свежесть слепка портала на момент исполнения; null — возраст
     * неизвестен (слепок из стора без кэша), прежнее значение не трогаем.
     */
    portalSnapshotAt?: number | null;
    detail?: string;
}

/**
 * Применить успешное прямое исполнение (А4): ядро отчёта выполнено в
 * Битриксе самим браузером. Попытка записывается в attempts, конверт из
 * клейма (`delivering`) уходит в `delivered` (хвоста нет) либо `partial`
 * (deferred[] ждёт досылки на бэк — эндпоинт А5). Duplicate-marker проходит
 * этой же дорогой: хвост тогда — то, что успело записаться в конверт.
 */
export const applyDirectExecution = (
    envelope: OutboxEnvelope,
    record: DirectExecutionRecord,
): OutboxEnvelope => {
    const to =
        record.deferred.length > 0
            ? OUTBOX_ENVELOPE_STATE.partial
            : OUTBOX_ENVELOPE_STATE.delivered;
    const attempt: OutboxAttempt = {
        targetId: record.targetId,
        at: record.at,
        outcome: OUTBOX_DELIVERY_OUTCOME.executedDirect,
        detail: record.detail,
    };

    return {
        ...releaseEnvelopeLease(transitionEnvelope(envelope, to, record.at)),
        attempts: [...envelope.attempts, attempt],
        // partial дренаж не ретраит до А5 — ждать нечего и ему.
        nextAttemptAt: null,
        executedDirect: true,
        deferred: record.deferred,
        portalSnapshotAt: record.portalSnapshotAt ?? envelope.portalSnapshotAt,
    };
};

/** Запись НЕПОЛНОГО прямого исполнения (А4) для applyDirectIncomplete. */
export interface DirectIncompleteRecord {
    /** Цель, исполнявшая конверт (direct-bitrix из реестра). */
    targetId: string;
    at: number;
    /** Cmd-ключи обязательных команд, не подтверждённых ответом батча. */
    failedCommands: string[];
    /** Хвост досылки, собранный исполнителем (может быть пуст). */
    deferred: OutboxDeferredStep[];
    portalSnapshotAt?: number | null;
    detail?: string;
}

/**
 * Применить НЕПОЛНОЕ прямое исполнение (А4): пишущий батч ушёл в Битрикс,
 * маркер записан, но часть обязательных команд подтверждения не получила.
 *
 * Почему именно `failed` без авторетраев, и почему без `delivered`/`partial`:
 * повторить батч нельзя (маркер в задаче даст duplicate-marker), отдать
 * бэку нельзя (он прямого исполнения не видел — исполнил бы отчёт второй
 * раз целиком). Значит, конверт больше НИКОМУ не адресован, и единственный
 * честный исход — видимый провал: успешно исполненным он не выглядит,
 * состав неприменившихся команд лежит в самом конверте, а `executedDirect`
 * навсегда закрывает ему дорогу на primary (см. isPrimaryForbidden) и
 * гасит повторный enqueue (mergeRequeuedEnvelope).
 */
export const applyDirectIncomplete = (
    envelope: OutboxEnvelope,
    record: DirectIncompleteRecord,
): OutboxEnvelope => {
    const attempt: OutboxAttempt = {
        targetId: record.targetId,
        at: record.at,
        outcome: OUTBOX_DELIVERY_OUTCOME.directIncomplete,
        detail: record.detail,
    };

    return {
        ...releaseEnvelopeLease(
            transitionEnvelope(
                envelope,
                OUTBOX_ENVELOPE_STATE.failed,
                record.at,
            ),
        ),
        attempts: [...envelope.attempts, attempt],
        // Ждать нечего: ни дренаж, ни человек этот конверт не починят.
        nextAttemptAt: null,
        executedDirect: true,
        directFailedCommands: record.failedCommands,
        deferred: record.deferred,
        portalSnapshotAt: record.portalSnapshotAt ?? envelope.portalSnapshotAt,
    };
};

/**
 * `failed`, который дренаж вправе ретраить сам: последняя попытка ДОСТАВКИ не
 * дала исхода — сервер молчал (`network-error`) либо ответил 5xx
 * (`server-error`, повтор через primary безопасен по идемпотентности).
 * Отвергнутые (rejected — 4xx или «failed» от бэкенда) и неполное прямое
 * исполнение (direct-incomplete — чинить нечем) авторетраев не получают.
 */
export const isRetryableFailure = (envelope: OutboxEnvelope): boolean => {
    if (envelope.state !== OUTBOX_ENVELOPE_STATE.failed) {
        return false;
    }
    const last = envelope.attempts.at(-1);

    return (
        last?.outcome === OUTBOX_DELIVERY_OUTCOME.networkError ||
        last?.outcome === OUTBOX_DELIVERY_OUTCOME.serverError
    );
};

/**
 * Отчёт проведён НЕ ЦЕЛИКОМ (А4): пишущий батч ушёл в Битрикс, но часть
 * обязательных команд подтверждения не получила.
 *
 * Единственное состояние конверта, которое требует ЧЕЛОВЕКА: повторить
 * нечем (маркер в задаче заблокирует повтор, бэку исходный payload слать
 * нельзя), поэтому ни дренаж, ни кнопка «Повторить» такому конверту не
 * помогут — менеджеру нужно открыть карточку клиента и сверить.
 * Недоставленным он не считается (isUndeliveredEnvelope) — счётчик и
 * полоска ведут его отдельной, тревожной строкой, пока конверт не уберёт
 * ретеншн (24ч).
 */
export const isIncompleteEnvelope = (envelope: OutboxEnvelope): boolean =>
    (envelope.directFailedCommands?.length ?? 0) > 0;

/**
 * Недоставленный — конверт, у которого доставка ещё впереди: `pending`,
 * `delivering` (в том числе с протухшим статусом — такой сознательно висит
 * в полоске), `partial` и сетевой `failed` (его дошлёт дренаж).
 * Терминальные `failed` сюда НЕ входят — ни отвергнутый (rejected:
 * 4xx/бизнес-отказ), ни неполно исполненный напрямую (direct-incomplete):
 * авторетраев им не положено, кросс-сессионного «Повторить» нет — полоска
 * «ждут отправки» на них врал бы, а зеркало счётчика (setUndelivered)
 * впустую взводило бы таймер дренажа.
 */
export const isUndeliveredEnvelope = (envelope: OutboxEnvelope): boolean =>
    envelope.state === OUTBOX_ENVELOPE_STATE.pending ||
    envelope.state === OUTBOX_ENVELOPE_STATE.delivering ||
    envelope.state === OUTBOX_ENVELOPE_STATE.partial ||
    isRetryableFailure(envelope);

/**
 * Была ли попытка, которую цель приняла. Accepted — единственная клиентская
 * улика «бэк уже видел эту операцию»: по ней дренаж сверяется со статусом
 * вместо слепого повторного POST (статус операции живёт на бэке час, после
 * его истечения повтор выполнил бы flow второй раз).
 */
export const hasAcceptedAttempt = (envelope: OutboxEnvelope): boolean =>
    envelope.attempts.some(
        attempt => attempt.outcome === OUTBOX_DELIVERY_OUTCOME.accepted,
    );

/**
 * Улика «сервер БЫЛ достижим, запрос мог долететь»: по конверту есть
 * попытка, на которую пришёл HTTP-ОТВЕТ — принятие (2xx), отказ (4xx или
 * бизнес-ошибка при HTTP 200) либо 5xx.
 *
 * Зачем отдельно от `hasAcceptedAttempt`: бэк пишет статус операции и
 * ставит job в очередь ДО исполнения flow, поэтому даже 504 от прокси
 * означает «апстрим запрос принял, job поставлен» — поднявшийся воркер
 * исполнит отчёт сам. Прямому пути по такому конверту делать нечего: его
 * исполнение стало бы вторым. «Ответа не было вовсе» (обрыв, таймаут —
 * `network-error`) уликой НЕ считается: это и есть молчание сервера, ради
 * которого прямой путь существует.
 *
 * Исходы прямой цели (`executed-direct`, `direct-incomplete`) сюда не
 * попадают: HTTP-ответы даёт только primary (и будущие серверные зеркала).
 */
export const hasServerRespondedAttempt = (envelope: OutboxEnvelope): boolean =>
    envelope.attempts.some(
        attempt =>
            attempt.outcome === OUTBOX_DELIVERY_OUTCOME.accepted ||
            attempt.outcome === OUTBOX_DELIVERY_OUTCOME.rejected ||
            attempt.outcome === OUTBOX_DELIVERY_OUTCOME.serverError,
    );

/**
 * Слияние повторного enqueue с уже лежащим конвертом той же операции:
 * «Повторить» едет через outbox с прежним operationId, и свежая перезапись
 * не должна стирать историю попыток — иначе пропадает accepted-улика, и
 * дренаж после истечения статуса пере-POST-ит уже выполненный flow (риск №1
 * плана — двойное исполнение).
 *
 * Есть accepted в слитой истории — конверт продолжает жить как `delivering`
 * («POST принят, исход неизвестен»), а не как «ещё не отправлялся»: именно
 * delivering-кандидатов дренаж сверяет со статусом перед досылкой. createdAt
 * остаётся от первого конверта — момент рождения отчёта. Конверт чужой
 * версии схемы не разбираем — перезапись свежим, как раньше.
 */
export const mergeRequeuedEnvelope = (
    existing: OutboxEnvelope | null,
    fresh: OutboxEnvelope,
): OutboxEnvelope => {
    if (!existing || existing.v !== fresh.v) {
        return fresh;
    }
    if (existing.executedDirect) {
        // Ядро уже исполнено напрямую (А4): повторный enqueue не вправе
        // вернуть конверт в pending — дренаж отправил бы ИСХОДНЫЙ payload на
        // primary, а бэк прямого исполнения не видел и выполнил бы flow
        // целиком второй раз (прямой запрет плана А5). Конверт остаётся как
        // есть; хвост deferred доедет своим каналом.
        return existing;
    }

    // Отметка «терминальный исход посчитан» СПЕЦИАЛЬНО не переносится:
    // `fresh` её не несёт, и это ровно то, что нужно. «Повторить» — новая
    // отправка (её считает event_sales_send_total), значит и новый исход:
    // перенеси мы отметку, у повторов исходов не было бы вовсе, и воронка
    // «начато против закончено» показывала бы вечную потерю.
    const merged: OutboxEnvelope = {
        ...fresh,
        attempts: [...existing.attempts, ...fresh.attempts],
        createdAt: existing.createdAt,
        // Отметка «прямой батч мог уйти» переживает повтор: свежий конверт
        // её не несёт, а без неё «Повторить» вернул бы конверту primary —
        // и оживший бэк исполнил бы отчёт второй раз по исходному payload.
        directAttempted: existing.directAttempted ?? fresh.directAttempted,
    };

    return hasAcceptedAttempt(merged)
        ? { ...merged, state: OUTBOX_ENVELOPE_STATE.delivering }
        : merged;
};
