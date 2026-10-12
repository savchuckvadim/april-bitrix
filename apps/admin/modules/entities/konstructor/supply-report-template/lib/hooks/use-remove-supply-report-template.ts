'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY } from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

export const useRemoveSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
