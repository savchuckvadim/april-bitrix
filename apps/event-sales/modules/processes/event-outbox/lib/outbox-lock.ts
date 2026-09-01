import type { OutboxLease } from './outbox-envelope';

/**
 * Эксклюзивность работы с конвертом между вкладками.
 *
 * Первый рубеж — Web Locks: `navigator.locks.request('evob:'+operationId,
 * {ifAvailable: true})` — живая вкладка, уже занявшая конверт, блокирует
 * остальных мгновенно, а смерть вкладки снимает лок сама. Второй рубеж —
 * lease-поле в самом конверте (tabId + until): работает там, где Web Locks
 * нет, и заодно служит маркером живости для дренажа — умершая вкладка лок
 * отпустила, но lease в записи остался и «протухает» по времени.
 */

const LOCK_PREFIX = 'evob:';

/**
 * Аренда живёт минуту: заведомо дольше цикла бэкоффа (2с/5с/15с). Констрейнт:
 * в фолбэке без Web Locks lease не атомарен (чтение → запись), а TTL короче
 * зависшего POST (axios без таймаута) — параллельные POST одного operationId
 * возможны; последствия гасит серверная идемпотентность в пределах
 * EVENT_FLOW_STATUS_TTL_SECONDS (1ч). При живых Web Locks путь чист.
 */
export const OUTBOX_LEASE_TTL_MS = 60_000;

/**
 * Идентификатор вкладки — на сессию. Тот же генератор, что у operationId:
 * `crypto.randomUUID` есть только в защищённом контексте, dev по http жив.
 */
const createTabId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

let tabId: string | null = null;

export const getOutboxTabId = (): string => {
    if (!tabId) {
        tabId = createTabId();
    }

    return tabId;
};

export const createOutboxLease = (
    now: number,
    ownerTabId: string = getOutboxTabId(),
): OutboxLease => ({ tabId: ownerTabId, until: now + OUTBOX_LEASE_TTL_MS });

export const isLeaseAlive = (
    lease: OutboxLease | undefined,
    now: number,
): boolean => !!lease && lease.until > now;

/** Конверт держит ЖИВАЯ аренда чужой вкладки — трогать нельзя. */
export const isLeaseHeldByOther = (
    lease: OutboxLease | undefined,
    now: number,
    ownTabId: string = getOutboxTabId(),
): boolean => isLeaseAlive(lease, now) && lease!.tabId !== ownTabId;

/**
 * Структурное подмножество LockManager — ровно то, чем пользуемся. Свой тип
 * нужен тестам (фейковый менеджер) и среде без DOM-типов.
 */
export interface OutboxLockManager {
    request: (
        name: string,
        options: { ifAvailable: boolean },
        task: (lock: unknown) => Promise<unknown>,
    ) => Promise<unknown>;
}

/** Лок занят другой вкладкой — задача не выполнялась. */
export const OUTBOX_LOCK_BUSY: unique symbol = Symbol('outbox-lock-busy');

const getNavigatorLocks = (): OutboxLockManager | null => {
    try {
        const nav = typeof navigator === 'undefined' ? undefined : navigator;
        const locks = (nav as { locks?: OutboxLockManager } | undefined)?.locks;

        return locks && typeof locks.request === 'function' ? locks : null;
    } catch {
        return null;
    }
};

/**
 * Выполнить задачу под локом операции. Лок занят — задача НЕ выполняется,
 * возвращается `OUTBOX_LOCK_BUSY` (не ждём: конвертом уже занимаются).
 * Web Locks нет — задача выполняется сразу: эксклюзивность обеспечивает
 * lease-проверка внутри самой задачи (см. outbox-delivery).
 */
export const withOperationLock = async <T>(
    operationId: string,
    task: () => Promise<T>,
    deps: { locks?: OutboxLockManager | null } = {},
): Promise<T | typeof OUTBOX_LOCK_BUSY> => {
    const locks = deps.locks !== undefined ? deps.locks : getNavigatorLocks();

    if (!locks) {
        return task();
    }

    try {
        return (await locks.request(
            LOCK_PREFIX + operationId,
            { ifAvailable: true },
            async lock => (lock ? await task() : OUTBOX_LOCK_BUSY),
        )) as T | typeof OUTBOX_LOCK_BUSY;
    } catch {
        // Web Locks есть, но сломан (урезанный API во фрейме) — не роняем
        // доставку, работаем на lease-рубеже.
        return task();
    }
};
