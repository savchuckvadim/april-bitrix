'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    LIBRARY_KIND,
    libraryActions,
    saveToLibrary,
    selectLibraryRights,
    type LibraryKind,
    type LibraryVisibility,
} from '@/modules/entities/library';
import { selectGeneralSet } from '@/modules/entities/row-set';

/**
 * «Сохранить в избранное / как акцию»: название + видимость по роли
 * (сотрудник — только себе; руководитель — отдел/портал). Акция доступна,
 * только если бэк разрешил хоть одну видимость для promotion.
 */
export const useSaveToLibrary = () => {
    const dispatch = useAppDispatch();
    const rights = useAppSelector(selectLibraryRights);
    const general = useAppSelector(selectGeneralSet);
    const actionStatus = useAppSelector(state => state.library.actionStatus);
    const actionError = useAppSelector(state => state.library.actionError);
    const dealTitle = useAppSelector(state => state.app.bitrix.deal?.TITLE ?? '');

    const [open, setOpen] = useState(false);
    const [kind, setKind] = useState<LibraryKind>(LIBRARY_KIND.FAVORITE);
    const [visibility, setVisibility] = useState<LibraryVisibility>('user');
    const [title, setTitle] = useState('');

    const visibilities: LibraryVisibility[] =
        (kind === LIBRARY_KIND.PROMOTION
            ? rights?.promotionVisibilities
            : rights?.favoriteVisibilities) ?? ['user'];
    const canPromote = (rights?.promotionVisibilities.length ?? 0) > 0;

    // выбранная видимость должна быть среди доступных для вида заготовки
    useEffect(() => {
        if (!visibilities.includes(visibility)) setVisibility(visibilities[0] ?? 'user');
    }, [visibilities, visibility]);

    const openDialog = () => {
        setTitle(dealTitle);
        setKind(LIBRARY_KIND.FAVORITE);
        dispatch(libraryActions.actionReset());
        setOpen(true);
    };

    const submit = async () => {
        const saved = await dispatch(
            saveToLibrary({ kind, visibility, title: title.trim() || dealTitle || 'Без названия' }),
        );
        if (saved) setOpen(false);
    };

    return {
        canSave: general.rows.length > 0,
        open,
        setOpen,
        openDialog,
        kind,
        setKind,
        canPromote,
        visibility,
        setVisibility,
        visibilities,
        title,
        setTitle,
        isSaving: actionStatus === 'busy',
        error: actionStatus === 'error' ? actionError : null,
        submit,
    };
};

export type SaveToLibraryState = ReturnType<typeof useSaveToLibrary>;
