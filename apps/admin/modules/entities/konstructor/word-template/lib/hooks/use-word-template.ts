'use client';

import { useQuery } from '@tanstack/react-query';
import { WORD_TEMPLATE_ITEM_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useWordTemplate = (id: string) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_ITEM_CASH_KEY, id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};
