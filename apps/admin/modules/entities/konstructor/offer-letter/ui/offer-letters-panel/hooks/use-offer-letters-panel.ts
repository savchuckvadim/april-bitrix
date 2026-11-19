'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit/lib/portal-options.util';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { usePortals } from '@/modules/entities/portal';
import { usePortalEmployees } from '@/modules/entities/portal/employees';
import { OFFER_LETTER_ACTION_TEXT as ACTION } from '../../../consts/offer-letter.consts';
import {
    useDeleteOfferLetter,
    useOfferLetters,
    useSetDefaultOfferLetter,
    useUpdateOfferLetter,
} from '../../../lib/hooks';
import { filterOfferLetters } from '../../../lib/offer-letter-view';
import {
    OFFER_LETTER_SCOPE,
    type OfferLetter,
    type OfferLetterScopeFilter,
} from '../../../model';

/**
 * Письма выбранного портала: выбор портала и фильтра, окно письма, быстрые
 * переключатели в таблице и удаление с подтверждением. Результат каждого
 * действия показывается по ответу бэка.
 */
export const useOfferLettersPanel = () => {
    const portals = usePortals();
    const [domain, setDomain] = useState<string | undefined>();
    const [scope, setScope] = useState<OfferLetterScopeFilter>(OFFER_LETTER_SCOPE.ALL);
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [editedLetter, setEditedLetter] = useState<OfferLetter | null>(null);
    const [letterToDelete, setLetterToDelete] = useState<OfferLetter | null>(null);

    const portalOptions = useMemo(() => toPortalOptions(portals.data), [portals.data]);
    const portalId = (portals.data ?? []).find(portal => portal.domain === domain)?.id;

    const lettersQuery = useOfferLetters(portalId);
    const employees = usePortalEmployees(portalId);
    const updateLetter = useUpdateOfferLetter();
    const setDefaultLetter = useSetDefaultOfferLetter();
    const deleteLetter = useDeleteOfferLetter();

    const allLetters = useMemo(() => lettersQuery.data ?? [], [lettersQuery.data]);
    const letters = useMemo(() => filterOfferLetters(allLetters, scope), [allLetters, scope]);
    const managerNames = useMemo(
        () => new Map((employees.data ?? []).map(employee => [employee.id, employee.name])),
        [employees.data],
    );

    let pendingId: string | null = null;
    if (updateLetter.isPending) pendingId = updateLetter.variables?.id ?? null;
    else if (setDefaultLetter.isPending) pendingId = setDefaultLetter.variables ?? null;

    const openCreate = (): void => {
        setEditedLetter(null);
        setDialogOpen(true);
    };

    const openEdit = (letter: OfferLetter): void => {
        setEditedLetter(letter);
        setDialogOpen(true);
    };

    const toggleActive = async (letter: OfferLetter, isActive: boolean): Promise<void> => {
        try {
            await updateLetter.mutateAsync({ id: letter.id, dto: { isActive } });
            toast.success(isActive ? ACTION.activatedToast : ACTION.deactivatedToast);
        } catch (error) {
            toast.error(getApiErrorMessage(error, ACTION.toggleError));
        }
    };

    const setDefault = async (letter: OfferLetter): Promise<void> => {
        try {
            await setDefaultLetter.mutateAsync(letter.id);
            toast.success(ACTION.defaultToast);
        } catch (error) {
            toast.error(getApiErrorMessage(error, ACTION.defaultError));
        }
    };

    const confirmDelete = async (): Promise<void> => {
        if (!letterToDelete) return;
        try {
            await deleteLetter.mutateAsync(letterToDelete.id);
            toast.success(ACTION.deletedToast);
        } catch (error) {
            toast.error(getApiErrorMessage(error, ACTION.deleteError));
        }
    };

    return {
        portalOptions,
        domain,
        setDomain: (next: string) => {
            setDomain(next);
            setScope(OFFER_LETTER_SCOPE.ALL);
        },
        portalId,
        scope,
        setScope,
        letters,
        hasLetters: allLetters.length > 0,
        managerNames,
        isLoading: lettersQuery.isLoading,
        isError: lettersQuery.isError,
        pendingId,
        isDialogOpen,
        setDialogOpen,
        editedLetter,
        openCreate,
        openEdit,
        toggleActive,
        setDefault,
        letterToDelete,
        setLetterToDelete,
        isDeleting: deleteLetter.isPending,
        confirmDelete,
    };
};
