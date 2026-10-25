import type { AppThunk, RootState } from '@/modules/app/model/store';
import { findMainRow } from '../../row-set';
import { restoreSnapshotRecord, serializeV2 } from '../../snapshot';
import type { SnapshotRecordDto } from '../../snapshot/model/dto';
import { LibraryHelper } from '../lib/api/library-helper';
import { toLibraryItem } from '../lib/library-item.util';
import type { LibraryKind, LibraryVisibility, LibrarySnapshotPayload } from './dto';
import { libraryActions } from './LibrarySlice';

const helper = new LibraryHelper();

const errorText = (error: unknown, fallback: string): string =>
    error instanceof Error ? error.message : fallback;

const actor = (state: RootState): { domain: string; userId: number } | null => {
    const { domain, bitrix } = state.app;
    const userId = Number(bitrix.user?.ID);
    return domain && Number.isFinite(userId) && userId > 0 ? { domain, userId } : null;
};

/** Слепок v2 текущей сборки без адреса сделки — заготовка живёт сама по себе. */
export const buildLibrarySnapshot = (state: RootState): LibrarySnapshotPayload | null => {
    const { general, alternative, context } = state.rowSet;
    if (!state.app.domain || !general.rows.length) return null;
    const main = findMainRow(general);
    const snapshot = serializeV2({
        state: {
            regionCode: context.regionCode,
            contractCode: main?.refs.contractCode ?? null,
            supplyCode: main?.refs.supplyCode ?? null,
            general,
            alternative,
            templateId: state.snapshot.templateId,
        },
        dealId: null,
        domain: state.app.domain,
        userId: Number(state.app.bitrix.user?.ID) || null,
        savedAt: new Date().toISOString(),
    });
    return {
        rows: JSON.stringify(snapshot),
        templateId: state.snapshot.templateId,
        dealName: state.app.bitrix.deal?.TITLE ?? null,
    };
};

/** Всё видимое пользователю — список один, экраны фильтруют по kind. */
export const fetchLibrary = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const who = actor(getState());
    if (!who) return;
    dispatch(libraryActions.loading());
    try {
        dispatch(libraryActions.setItems(await helper.list(who.domain, who.userId)));
    } catch (error) {
        dispatch(libraryActions.failed(errorText(error, 'библиотека не загружена')));
    }
};

export const fetchLibraryRights = (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const who = actor(getState());
    if (!who) return;
    try {
        dispatch(libraryActions.setRights(await helper.rights(who.domain, who.userId)));
    } catch (error) {
        console.warn('library: права не получены', error);
    }
};

/** Текущая сборка → избранное/акция с выбранной видимостью. */
export const saveToLibrary =
    (input: { kind: LibraryKind; visibility: LibraryVisibility; title: string }): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const who = actor(state);
        const snapshot = buildLibrarySnapshot(state);
        if (!who || !snapshot) {
            dispatch(libraryActions.actionFailed('Нечего сохранять'));
            return false;
        }
        dispatch(libraryActions.actionStarted());
        try {
            const record = await helper.create({ ...who, ...input, snapshot });
            dispatch(libraryActions.itemUpserted(toLibraryItem(record, input, who.userId)));
            dispatch(libraryActions.actionDone());
            return true;
        } catch (error) {
            dispatch(libraryActions.actionFailed(errorText(error, 'не сохранено')));
            return false;
        }
    };

/**
 * Заготовка → конструктор: тот же restore, что у слепка сделки (v1/v2).
 * Переход на /document — у экрана: он знает, куда вести.
 */
export const loadFromLibrary =
    (id: number): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const who = actor(getState());
        if (!who) return false;
        dispatch(libraryActions.loadingItem(id));
        try {
            const record: SnapshotRecordDto = await helper.get(who.domain, who.userId, id);
            await dispatch(restoreSnapshotRecord(record));
            return true;
        } catch (error) {
            dispatch(libraryActions.actionFailed(errorText(error, 'заготовка не загружена')));
            return false;
        } finally {
            dispatch(libraryActions.loadingItem(null));
        }
    };

export const patchLibraryItem =
    (id: number, patch: { title?: string; visibility?: LibraryVisibility; isArchived?: boolean }): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const state = getState();
        const who = actor(state);
        const current = state.library.items.find(item => item.id === id);
        if (!who || !current) return false;
        dispatch(libraryActions.actionStarted());
        try {
            await helper.patch(id, { ...who, ...patch });
            if (patch.isArchived) dispatch(libraryActions.itemRemoved(id));
            else dispatch(libraryActions.itemUpserted({ ...current, ...patch }));
            dispatch(libraryActions.actionDone());
            return true;
        } catch (error) {
            dispatch(libraryActions.actionFailed(errorText(error, 'не сохранено')));
            return false;
        }
    };

export const removeLibraryItem =
    (id: number): AppThunk<Promise<boolean>> =>
    async (dispatch, getState) => {
        const who = actor(getState());
        if (!who) return false;
        dispatch(libraryActions.actionStarted());
        try {
            await helper.remove(who.domain, who.userId, id);
            dispatch(libraryActions.itemRemoved(id));
            dispatch(libraryActions.actionDone());
            return true;
        } catch (error) {
            dispatch(libraryActions.actionFailed(errorText(error, 'не удалено')));
            return false;
        }
    };
