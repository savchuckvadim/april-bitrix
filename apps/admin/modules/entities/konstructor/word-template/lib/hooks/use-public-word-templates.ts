'use client';

import { useQuery } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const usePublicWordTemplates = () => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_LIST_CASH_KEY, 'public'],
        queryFn: async () => {
            const response = await helper.findPublic();
            return response;
        },
    });
};
