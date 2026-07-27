'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectIsPublic } from '@/modules/app';
import { pbxEditKey } from '../lib/edit-key.util';
import { loadPbxFieldsMeta, updatePbxFieldValue } from '../model/pbx-fields-thunks';
import type { PbxFieldEditState } from '../model/pbx-fields-slice';
import type { PbxFieldCode, PbxFieldItem, PbxFieldMeta } from '../model';

export interface UsePbxFieldResult {
    /** Метаданные поля; undefined — мета не загружена/поле не настроено. */
    meta: PbxFieldMeta | undefined;
    /** Текущее значение: optimistic-override поверх server-значения. */
    value: string | null;
    /** Текущий элемент enum-поля (для бэйджа) и его индекс в items. */
    item: PbxFieldItem | undefined;
    itemIndex: number;
    /** Статус текущего сейва (микро-бейдж) или undefined. */
    edit: PbxFieldEditState | undefined;
    /** Можно ли редактировать (не /share, мета загружена). */
    canEdit: boolean;
    /** Сохранить новое значение (optimistic + revert-on-error). */
    save: (value: string | null) => void;
}

/**
 * Вся логика inline-редактирования одного pbx-поля одной сущности:
 * ленивая мета (idle-guard), optimistic-значение, статус сейва, гейт
 * публичной страницы. UI-компоненты только рендерят.
 */
export const usePbxField = (
    fieldCode: PbxFieldCode,
    entityId: number,
    serverValue: string | null,
): UsePbxFieldResult => {
    const dispatch = useAppDispatch();
    const isPublic = useAppSelector(selectIsPublic);
    const meta = useAppSelector(
        state => state.pbxFields.meta.byCode[fieldCode],
    );
    const metaStatus = useAppSelector(state => state.pbxFields.meta.status);

    // Ленивая загрузка меты при первом использовании поля на странице.
    useEffect(() => {
        if (metaStatus === 'idle' && !isPublic) {
            dispatch(loadPbxFieldsMeta());
        }
    }, [dispatch, metaStatus, isPublic]);

    const key = meta
        ? pbxEditKey(meta.entity, entityId, fieldCode)
        : null;
    const override = useAppSelector(state =>
        key ? state.pbxFields.overrides[key] : undefined,
    );
    const edit = useAppSelector(state =>
        key ? state.pbxFields.edits[key] : undefined,
    );

    const value = override !== undefined ? override.value : serverValue;

    const { item, itemIndex } = useMemo(() => {
        const items = meta?.items ?? [];
        const index = value
            ? items.findIndex(candidate => candidate.code === value)
            : -1;
        return { item: index >= 0 ? items[index] : undefined, itemIndex: index };
    }, [meta, value]);

    const save = useCallback(
        (nextValue: string | null) => {
            if (nextValue === value) return;
            void dispatch(
                updatePbxFieldValue({
                    fieldCode,
                    entityId,
                    value: nextValue,
                    prevValue: value,
                }),
            );
        },
        [dispatch, fieldCode, entityId, value],
    );

    return {
        meta,
        value,
        item,
        itemIndex,
        edit,
        canEdit: !isPublic && !!meta,
        save,
    };
};
