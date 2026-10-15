'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    WORD_TEMPLATE_LIST_CASH_KEY,
    WORD_TEMPLATE_PORTALS_CASH_KEY,
} from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

/**
 * Привязки портала (offer_template_portal) — ключ к портальному
 * администрированию КП: у привязки СВОИ is_active / is_default, отдельные от
 * флагов самого шаблона. «Шаблон по умолчанию портала» живёт именно здесь.
 */
export const usePortalWordTemplateBindings = (portalId: string | undefined) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_PORTALS_CASH_KEY, 'portal', portalId],
        queryFn: async () => helper.getPortalBindingsByPortal(portalId as string),
        enabled: !!portalId,
    });
};

/** Подключить / отключить / переключить флаги привязки — с инвалидацией списков. */
export const usePortalWordTemplateBindingActions = (portalId: string | undefined) => {
    const queryClient = useQueryClient();
    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_PORTALS_CASH_KEY] });
        queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
    };

    const attach = useMutation({
        mutationFn: async (templateId: string) =>
            helper.attachToPortal(templateId, portalId as string),
        onSuccess: invalidate,
    });

    const detach = useMutation({
        mutationFn: async (bindingId: string) => helper.detachBinding(bindingId),
        onSuccess: invalidate,
    });

    const setActive = useMutation({
        mutationFn: async ({ bindingId, isActive }: { bindingId: string; isActive: boolean }) =>
            helper.setBindingActive(bindingId, isActive),
        onSuccess: invalidate,
    });

    const setDefault = useMutation({
        mutationFn: async ({ bindingId, isDefault }: { bindingId: string; isDefault: boolean }) =>
            helper.setBindingDefault(bindingId, isDefault),
        onSuccess: invalidate,
    });

    return { attach, detach, setActive, setDefault };
};
