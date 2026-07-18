'use client';

import { useQuery } from '@tanstack/react-query';
import { WordTemplateFindAllWordTemplatesParams } from '@workspace/nest-konstructor-api';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useWordTemplates = (
    params: WordTemplateFindAllWordTemplatesParams,
) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_LIST_CASH_KEY, params],
        queryFn: async () => {
            const response = await helper.list(params);
            return response;
        },
    });
};
