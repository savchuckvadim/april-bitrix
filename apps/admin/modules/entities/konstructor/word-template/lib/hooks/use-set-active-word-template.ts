'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    WORD_TEMPLATE_ITEM_CASH_KEY,
    WORD_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useSetActiveWordTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await helper.setActive(id);
            return response;
        },
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_ITEM_CASH_KEY, id] });
        },
    });
};
