'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    WORD_TEMPLATE_ITEM_CASH_KEY,
    WORD_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';
import { IUpdateWordTemplateDto } from '../../model';

const helper = new WordTemplateHelper();

export const useUpdateWordTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, dto }: { id: string; dto: IUpdateWordTemplateDto }) => {
            const response = await helper.update(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
            queryClient.invalidateQueries({
                queryKey: [WORD_TEMPLATE_ITEM_CASH_KEY, variables.id],
            });
        },
    });
};
