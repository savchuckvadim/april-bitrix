'use client';

import { useQuery } from '@tanstack/react-query';
import { DEPARTMENT_USERS_CASH_KEY } from '../../consts/word-template.consts';
import { WordTemplateHelper } from '../api/word-template.helper';
import { sortDepartmentUsers } from '../utils/word-template-user-selection';

const helper = new WordTemplateHelper();

/**
 * Пользователи отдела продаж портала — источник для выбора «от лица кого»
 * настраивать шаблоны. Бэкенд кэширует ответ в Redis на день, поэтому
 * здесь staleTime длинный: повторный выбор портала не бьёт в Bitrix.
 */
export const useDepartmentUsers = (domain: string | undefined) => {
    return useQuery({
        queryKey: [DEPARTMENT_USERS_CASH_KEY, domain],
        queryFn: async () => sortDepartmentUsers(await helper.getDepartmentUsers(domain as string)),
        enabled: !!domain,
        staleTime: 10 * 60 * 1000,
    });
};
