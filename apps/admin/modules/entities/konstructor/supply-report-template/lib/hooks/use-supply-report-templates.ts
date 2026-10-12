'use client';

import { useQuery } from '@tanstack/react-query';
import { SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY } from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';
import type { ISupplyReportTemplateQuery } from '../../model';

const helper = new SupplyReportTemplateHelper();

/**
 * Список шаблонов. Один хук на оба дерева: `portalId` задан — берём
 * портальный маршрут (он отдаёт портальные ВМЕСТЕ с унаследованными
 * общими), иначе — глобальный список.
 */
export const useSupplyReportTemplates = (
    query: ISupplyReportTemplateQuery = {},
    portalId?: string,
) =>
    useQuery({
        queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY, portalId ?? null, query],
        queryFn: () =>
            portalId
                ? helper.listByPortal(portalId, query)
                : helper.list(query),
    });
