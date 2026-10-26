import type { BulkPortalRegionItemDto } from '@workspace/nest-admin-api';

/** Правка по одному региону, ещё не отправленная в систему */
export interface PendingRegionChange {
    regionId: number;
    /** Доступен ли регион порталу после правок */
    enabled: boolean;
    /**
     * Свой рабс портала: строка — задать, null — вернуть общий рабс
     * региона, undefined — не менять.
     */
    ownAbs?: string | null;
}

/** Состояние региона, пришедшее с сервера */
export interface ServerRegionState {
    enabled: boolean;
}

/**
 * Применение галочки к черновику. Если значение вернули к тому, что на
 * сервере, и свой рабс не правили — запись из черновика убирается, иначе
 * в «не сохранено» копились бы пустые правки.
 */
export const applyToggle = (
    changes: Map<number, PendingRegionChange>,
    serverState: Map<number, ServerRegionState>,
    regionId: number,
    enabled: boolean,
): Map<number, PendingRegionChange> => {
    const next = new Map(changes);
    const current = next.get(regionId);
    const server = serverState.get(regionId);

    if (server?.enabled === enabled && current?.ownAbs === undefined) {
        next.delete(regionId);
        return next;
    }
    next.set(regionId, { regionId, enabled, ownAbs: current?.ownAbs });
    return next;
};

/**
 * Применение своего рабса. Своя цена возможна только у доступного
 * порталу региона, поэтому задание рабса включает галочку — кроме
 * случая, когда её только что сняли вручную (тогда правка рабса
 * сохраняется, но регион остаётся выключенным).
 */
export const applyOwnAbs = (
    changes: Map<number, PendingRegionChange>,
    regionId: number,
    ownAbs: string | null,
): Map<number, PendingRegionChange> => {
    const next = new Map(changes);
    const current = next.get(regionId);
    // Галочку в черновике уважаем, иначе включаем: задали цену — значит нужен.
    const enabled = current?.enabled ?? true;
    next.set(regionId, { regionId, enabled, ownAbs });
    return next;
};

/** Состояние региона с учётом черновика — его показывает таблица */
export const effectiveState = (
    changes: Map<number, PendingRegionChange>,
    serverState: Map<number, ServerRegionState>,
    regionId: number,
): PendingRegionChange => {
    const pending = changes.get(regionId);
    if (pending) return pending;
    return {
        regionId,
        enabled: serverState.get(regionId)?.enabled ?? false,
    };
};

/**
 * Черновик → запрос. Поле своего рабса передаётся только когда его
 * действительно правили: иначе система не должна его трогать.
 */
export const toBulkItems = (
    changes: Map<number, PendingRegionChange>,
): BulkPortalRegionItemDto[] =>
    [...changes.values()].map(change => ({
        regionId: change.regionId,
        enabled: change.enabled,
        ...(change.ownAbs !== undefined ? { ownAbs: change.ownAbs } : {}),
    }));
