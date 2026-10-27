'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BadgeItem, BadgeMode, BadgeTarget, PortalBadges } from '../../model';
import {
    copyDefaults,
    findDraftIssues,
    moveBadge,
    newBadge,
    removeBadge,
    sameBadges,
    updateBadge,
} from '../badges-draft';
import { usePortalBadges, useSaveBadges } from './use-badges';

/**
 * Черновик редактора: режим и свой набор. Инициализируется с сервера и
 * переинициализируется после сохранения (ответ бэка кладётся в кэш и
 * становится новой базой). «Есть правки» — сравнение с базой по содержанию.
 */
export const useBadgesEditor = (portalId: number) => {
    const query = usePortalBadges(portalId);
    const saveMutation = useSaveBadges(portalId);

    const base: PortalBadges | undefined = query.data;
    const [mode, setMode] = useState<BadgeMode>('default');
    const [items, setItems] = useState<BadgeItem[]>([]);

    useEffect(() => {
        if (!base) return;
        setMode(base.mode);
        setItems(copyDefaults(base.items));
    }, [base]);

    const dirty = useMemo(
        () => !!base && (base.mode !== mode || !sameBadges(base.items, items)),
        [base, mode, items],
    );
    const issues = useMemo(() => (mode === 'own' ? findDraftIssues(items) : []), [mode, items]);

    const add = useCallback((target: BadgeTarget) => {
        setItems(current => [...current, newBadge(current, target)]);
    }, []);
    const update = useCallback((code: string, patch: Partial<BadgeItem>) => {
        setItems(current => updateBadge(current, code, patch));
    }, []);
    const remove = useCallback((code: string) => {
        setItems(current => removeBadge(current, code));
    }, []);
    const move = useCallback((code: string, direction: 'up' | 'down') => {
        setItems(current => moveBadge(current, code, direction));
    }, []);
    const takeDefaults = useCallback(() => {
        if (base) setItems(copyDefaults(base.defaults));
    }, [base]);
    const discard = useCallback(() => {
        if (!base) return;
        setMode(base.mode);
        setItems(copyDefaults(base.items));
    }, [base]);

    const save = useCallback(() => {
        if (issues.length) return;
        saveMutation.mutate({
            mode,
            items: items.map(item => ({ ...item, text: item.text.trim() })),
        });
    }, [issues.length, saveMutation, mode, items]);

    return {
        isLoading: query.isLoading,
        isError: query.isError,
        base,
        mode,
        setMode,
        items,
        dirty,
        issues,
        add,
        update,
        remove,
        move,
        takeDefaults,
        discard,
        save,
        isSaving: saveMutation.isPending,
    };
};
