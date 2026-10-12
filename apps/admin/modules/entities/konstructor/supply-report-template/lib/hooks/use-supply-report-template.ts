'use client';

import { useQuery } from '@tanstack/react-query';
import { SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY } from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

/** Один шаблон по id. */
export const useSupplyReportTemplate = (id: string) =>
    useQuery({
        queryKey: [SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY, id],
        queryFn: () => helper.get(id),
        enabled: !!id,
    });
