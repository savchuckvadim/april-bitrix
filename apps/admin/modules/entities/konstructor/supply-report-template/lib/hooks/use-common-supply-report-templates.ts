'use client';

import { useQuery } from '@tanstack/react-query';
import { SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY } from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';
import type { ISupplyReportTemplateQuery } from '../../model';

const helper = new SupplyReportTemplateHelper();

/** Только общие шаблоны (`portal_id IS NULL`). */
export const useCommonSupplyReportTemplates = (
    query: ISupplyReportTemplateQuery = {},
) =>
    useQuery({
        queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY, 'common', query],
        queryFn: () => helper.listCommon(query),
    });
