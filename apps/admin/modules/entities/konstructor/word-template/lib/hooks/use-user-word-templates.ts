'use client';

import { useQuery } from '@tanstack/react-query';
import { WORD_TEMPLATE_LIST_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';

const helper = new WordTemplateHelper();

/**
 * Шаблоны ГЛАЗАМИ пользователя портала: список + его выбор
 * (текущий / избранное / активность из user_selected_templates).
 * Раньше хук отбрасывал `selected` — без него режим «от лица пользователя»
 * в админке невозможен.
 */
export const useUserWordTemplates = (userId: string, portalId: string) => {
    return useQuery({
        queryKey: [WORD_TEMPLATE_LIST_CASH_KEY, 'user', userId, portalId],
        queryFn: async () => helper.findUserTemplates(userId, portalId),
        enabled: !!userId && !!portalId,
    });
};
