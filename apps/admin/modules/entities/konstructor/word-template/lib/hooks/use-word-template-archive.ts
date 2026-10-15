'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    WORD_TEMPLATE_ITEM_CASH_KEY,
    WORD_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

/** Архив / возврат из архива — через PATCH (мутирующий GET бэкенда не используем). */
export const useArchiveWordTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => helper.archive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_ITEM_CASH_KEY, id] });
        },
    });
};

export const useUnarchiveWordTemplate = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => helper.unarchive(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_ITEM_CASH_KEY, id] });
        },
    });
};
