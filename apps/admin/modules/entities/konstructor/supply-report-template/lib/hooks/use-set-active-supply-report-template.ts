'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY,
    SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

/**
 * Флаг активности передаётся ЯВНО: на бэке он optional и «не передан»
 * трактуется как `true`, поэтому «выключить» без явного `false` невыразимо.
 */
export const useSetActiveSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            helper.setActive(id, isActive),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY, variables.id],
            });
        },
    });
};
