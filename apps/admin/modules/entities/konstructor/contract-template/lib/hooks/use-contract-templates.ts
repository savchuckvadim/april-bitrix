'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CONTRACT_TEMPLATE_LIST_CASH_KEY } from '../../consts/contract-template.consts';
import { ContractTemplateHelper } from '../api/contract-template.helper';
import type { IContractTemplateQuery } from '../../model';

const helper = new ContractTemplateHelper();

/**
 * Страница списка шаблонов договора.
 *
 * `params` входит в ключ кэша целиком, поэтому смена страницы/фильтра —
 * это отдельный запрос с `take`/`skip`, а НЕ фильтрация загруженного
 * массива. `keepPreviousData` оставляет предыдущую страницу на экране,
 * пока грузится следующая: иначе таблица на каждый шаг пагинации
 * схлопывается в «Нет данных».
 */
export const useContractTemplates = (params: IContractTemplateQuery) => {
    return useQuery({
        queryKey: [CONTRACT_TEMPLATE_LIST_CASH_KEY, params],
        queryFn: () => helper.list(params),
        placeholderData: keepPreviousData,
    });
};
