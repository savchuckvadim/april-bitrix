'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';
import { ICreateWordTemplateDto } from '../../model';

const helper = new WordTemplateHelper();

export const useCreateWordTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dto: ICreateWordTemplateDto) => {
            const response = await helper.create(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [WORD_TEMPLATE_LIST_CASH_KEY] });
        },
    });
};
