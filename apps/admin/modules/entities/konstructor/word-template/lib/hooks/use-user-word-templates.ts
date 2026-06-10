'use client';

import { useQuery } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

export const useUserWordTemplates = (userId: string, portalId: string) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_LIST_CASH_KEY, 'user', userId, portalId],
        queryFn: async () => {
            const response = await helper.findUserTemplates(userId, portalId);
            return response;
        },
        enabled: !!userId && !!portalId,
    });
};
