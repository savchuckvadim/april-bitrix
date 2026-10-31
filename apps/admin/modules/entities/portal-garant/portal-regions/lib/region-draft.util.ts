import type { BulkPortalRegionItem } from '../model';

/** Правка по одному региону, ещё не отправленная в систему */
export interface PendingRegionChange {
    regionId: number;
    /** Доступен ли регион порталу после правок */
    enabled: boolean;
    /**
     * Ручной рабс портала: строка — задать, null — вернуть общий рабс
     * региона, undefined — не менять.
     */
    ownAbs?: string | null;
    /**
     * Регион-источник рабса: число — задать, null — вернуть общий рабс,
     * undefined — не менять. С ручным рабсом взаимоисключающий.
     */
    ownAbsRegionId?: number | null;
}

/** Состояние региона, пришедшее с сервера */
export interface ServerRegionState {
    enabled: boolean;
    /** Ручной рабс; null — не задан */
    ownAbs: number | null;
    /** Регион-источник; null — не задан */
    ownAbsRegionId: number | null;
}

/** Что показывать в ячейке «Свой рабс» с учётом черновика */
export type OwnPriceView =
    | { kind: 'none' }
    | { kind: 'manual'; abs: string }
    | { kind: 'source'; regionId: number };

/** Что таблица показывает в строке региона */
export interface RegionRowState {
    enabled: boolean;
    /** В строке есть несохранённая правка */
    isPending: boolean;
    view: OwnPriceView;
    /** Рабс, по которому портал будет считать после сохранения */
    effectiveAbs: number;
    isAbsInvalid: boolean;
}

/** Предел колонки own_abs: decimal(8, 2) */
const MAX_OWN_ABS = 999999.99;

/** Ввод поля рабса → значение черновика: запятая как точка, пусто — сброс */
export const normalizeOwnAbsInput = (raw: string): string | null => {
    const value = raw.trim().replace(',', '.');
    return value === '' ? null : value;
};

export const isValidOwnAbs = (value: string): boolean => {
    const abs = Number(value);
    return Number.isFinite(abs) && abs > 0 && abs <= MAX_OWN_ABS;
};

/** Сколько строк черновика нельзя отправить из-за неверного рабса */
export const countInvalidOwnAbs = (
    changes: Map<number, PendingRegionChange>,
): number =>
    [...changes.values()].filter(
        change =>
            typeof change.ownAbs === 'string' && !isValidOwnAbs(change.ownAbs),
    ).length;

/** Правили ли свою цену в черновике */
const hasOwnEdit = (change?: PendingRegionChange): boolean =>
    change?.ownAbs !== undefined || change?.ownAbsRegionId !== undefined;

/**
 * Применение галочки к черновику. Если значение вернули к тому, что на
 * сервере, и свою цену не правили — запись из черновика убирается, иначе
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

    if (server?.enabled === enabled && !hasOwnEdit(current)) {
        next.delete(regionId);
        return next;
    }
    next.set(regionId, {
        regionId,
        enabled,
        ownAbs: current?.ownAbs,
        ownAbsRegionId: current?.ownAbsRegionId,
    });
    return next;
};

/**
 * Ручной рабс. Своя цена возможна только у доступного порталу региона,
 * поэтому задание включает галочку — кроме случая, когда её только что
 * сняли вручную. Ручной рабс вытесняет регион-источник из черновика:
 * в запрос уходит только одно из двух, сервер сбрасывает второе сам.
 */
export const applyOwnAbs = (
    changes: Map<number, PendingRegionChange>,
    regionId: number,
    ownAbs: string | null,
): Map<number, PendingRegionChange> => {
    const next = new Map(changes);
    const current = next.get(regionId);
    const enabled = current?.enabled ?? true;
    next.set(regionId, { regionId, enabled, ownAbs });
    return next;
};

/** Регион-источник. Правила те же, что у ручного рабса. */
export const applyOwnSource = (
    changes: Map<number, PendingRegionChange>,
    regionId: number,
    ownAbsRegionId: number | null,
): Map<number, PendingRegionChange> => {
    const next = new Map(changes);
    const current = next.get(regionId);
    const enabled = current?.enabled ?? true;
    next.set(regionId, { regionId, enabled, ownAbsRegionId });
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

/** Своя цена региона: черновик перебивает сервер, null в черновике — сброс */
export const ownPriceView = (
    pending: PendingRegionChange | undefined,
    server: ServerRegionState | undefined,
): OwnPriceView => {
    if (pending?.ownAbs !== undefined) {
        return pending.ownAbs === null
            ? { kind: 'none' }
            : { kind: 'manual', abs: pending.ownAbs };
    }
    if (pending?.ownAbsRegionId !== undefined) {
        return pending.ownAbsRegionId === null
            ? { kind: 'none' }
            : { kind: 'source', regionId: pending.ownAbsRegionId };
    }
    if (server?.ownAbsRegionId) {
        return { kind: 'source', regionId: server.ownAbsRegionId };
    }
    if (server?.ownAbs) {
        return { kind: 'manual', abs: String(server.ownAbs) };
    }
    return { kind: 'none' };
};

/**
 * Действующий рабс с учётом черновика: источник → ручной → общий.
 * Источник, которого нет в справочнике, считается не заданным.
 */
export const resolveDraftAbs = (
    view: OwnPriceView,
    regionAbs: number,
    absByRegionId: Map<number, number>,
): number => {
    if (view.kind === 'source') {
        return absByRegionId.get(view.regionId) ?? regionAbs;
    }
    if (view.kind === 'manual') {
        const abs = Number(view.abs);
        return Number.isFinite(abs) && abs > 0 ? abs : regionAbs;
    }
    return regionAbs;
};

/** Строка таблицы: выключенный регион считается по общему рабсу */
export const regionRowState = (
    changes: Map<number, PendingRegionChange>,
    serverState: Map<number, ServerRegionState>,
    absByRegionId: Map<number, number>,
    regionId: number,
): RegionRowState => {
    const pending = changes.get(regionId);
    const { enabled } = effectiveState(changes, serverState, regionId);
    const view = ownPriceView(pending, serverState.get(regionId));
    const regionAbs = absByRegionId.get(regionId) ?? 0;
    return {
        enabled,
        isPending: pending !== undefined,
        view,
        effectiveAbs: enabled
            ? resolveDraftAbs(view, regionAbs, absByRegionId)
            : regionAbs,
        isAbsInvalid: view.kind === 'manual' && !isValidOwnAbs(view.abs),
    };
};

/**
 * Черновик → запрос. Поля своей цены передаются только когда их
 * действительно правили: иначе система не должна их трогать.
 */
export const toBulkItems = (
    changes: Map<number, PendingRegionChange>,
): BulkPortalRegionItem[] =>
    [...changes.values()].map(change => ({
        regionId: change.regionId,
        enabled: change.enabled,
        ...(change.ownAbs !== undefined ? { ownAbs: change.ownAbs } : {}),
        ...(change.ownAbsRegionId !== undefined
            ? { ownAbsRegionId: change.ownAbsRegionId }
            : {}),
    }));
