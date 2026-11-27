'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import {
    archivedCount,
    bindingLabelOf,
    canManageInvoiceTemplate,
    canStartCreate,
    invoiceTemplateQuota,
    invoiceTemplateQuotaHint,
    useInvoiceTemplateActions,
    useInvoiceTemplates,
    useResolvedInvoiceTemplate,
    visibleInvoiceTemplates,
    type InvoiceTemplate,
} from '@/modules/entities/invoice-template';
import { resolverCardView } from '../lib/resolver-card.util';
import { useInvoiceCheckCriteria } from './use-invoice-check-criteria';

/** Окно формы: закрыто, создание или правка конкретного шаблона. */
interface FormDialogState {
    open: boolean;
    editing: InvoiceTemplate | null;
}

const CLOSED: FormDialogState = { open: false, editing: null };

/**
 * Экран шаблонов счетов: список с архивом по переключателю, квота портала,
 * карточка «какой шаблон уйдёт», действия над строками и окно формы.
 */
export const useInvoiceTemplatesScreen = () => {
    const router = useRouter();
    const list = useInvoiceTemplates();
    const actions = useInvoiceTemplateActions(list.reload);
    const providers = useAppSelector(state => state.documentProvider.items);
    const isSuperUser = useAppSelector(state => state.app.isSuperUser);
    const [showArchived, setShowArchived] = useState(false);
    const [dialog, setDialog] = useState<FormDialogState>(CLOSED);

    const check = useInvoiceCheckCriteria(providers);
    const resolved = useResolvedInvoiceTemplate(check.criteria, list.version);

    const quota = useMemo(
        () => invoiceTemplateQuota(list.items, list.portalId, providers.length),
        [list.items, list.portalId, providers.length],
    );
    const canCreate = canStartCreate({
        isSuperUser,
        portalId: list.portalId,
        providerCount: providers.length,
        quota,
        editing: null,
    });
    const rows = useMemo(
        () =>
            visibleInvoiceTemplates(list.items, showArchived).map(template => ({
                template,
                bindingLabel: bindingLabelOf(template, providers),
                canManage: canManageInvoiceTemplate(template, isSuperUser),
            })),
        [list.items, showArchived, providers, isSuperUser],
    );
    const card = useMemo(
        () => resolverCardView(resolved, list.items),
        [resolved, list.items],
    );

    return {
        rows,
        total: list.items.length,
        archived: archivedCount(list.items),
        isLoading: list.status === 'loading',
        loadError: list.error,
        isRefreshing: list.isRefreshing,
        hasPortal: list.portalId !== null,
        quota,
        canCreate,
        createHint: canCreate
            ? undefined
            : list.portalId === null
              ? 'Портал не определён'
              : 'Достигнут лимит шаблонов портала',
        busyId: actions.busyId,
        showArchived,
        setShowArchived,
        card,
        isCardRefreshing: resolved.status === 'loading',
        cardBindingLabel: card.template
            ? bindingLabelOf(card.template, providers)
            : null,
        quotaText: list.portalId === null ? null : invoiceTemplateQuotaHint(quota),
        check,
        dialog,
        isSaving: actions.isSaving,
        reload: () => void list.reload(),
        back: () => router.back(),
        openCreate: () => setDialog({ open: true, editing: null }),
        openEdit: (template: InvoiceTemplate) =>
            setDialog({ open: true, editing: template }),
        closeDialog: () => setDialog(CLOSED),
        create: actions.create,
        update: actions.update,
        toggleActive: (template: InvoiceTemplate, isActive: boolean) =>
            void actions.setActive(template, isActive),
        toggleDefault: (template: InvoiceTemplate) =>
            void actions.setDefault(template, !template.isDefault),
        toggleArchive: (template: InvoiceTemplate) =>
            void (template.isArchived
                ? actions.unarchive(template)
                : actions.archive(template)),
        download: (template: InvoiceTemplate) => void actions.download(template),
        // подтверждение тостом с действием, как на витрине шаблонов КП
        remove: (template: InvoiceTemplate) =>
            toast(`Удалить шаблон «${template.name}»?`, {
                action: {
                    label: 'Удалить',
                    onClick: () => void actions.remove(template),
                },
            }),
    };
};

export type InvoiceTemplatesScreenState = ReturnType<
    typeof useInvoiceTemplatesScreen
>;
