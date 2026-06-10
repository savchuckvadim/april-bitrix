'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useRemoveWordTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const response = await helper.remove(id);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
        },
    });
};
