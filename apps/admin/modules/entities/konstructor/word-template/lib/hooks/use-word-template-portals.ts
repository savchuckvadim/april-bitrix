'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    WORD_TEMPLATE_LIST_CASH_KEY,
    WORD_TEMPLATE_PORTALS_CASH_KEY,
} from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

/** К каким порталам привязан шаблон (join-таблица offer_template_portal). */
export const useWordTemplatePortals = (templateId: string | undefined) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_PORTALS_CASH_KEY, templateId],
        queryFn: async () => helper.getPortalBindings(templateId as string),
        enabled: !!templateId,
    });
};

/** Полная синхронизация привязок под мультиселект порталов. */
export const useSyncWordTemplatePortals = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, portalIds }: { id: string; portalIds: string[] }) =>
            helper.syncPortals(id, portalIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [WORD_TEMPLATE_PORTALS_CASH_KEY, variables.id],
            });
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
        },
    });
};
