'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY,
    SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';
import type { IUpdateSupplyReportTemplateDto } from '../../model';

const helper = new SupplyReportTemplateHelper();

export const useUpdateSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            dto,
        }: {
            id: string;
            dto: IUpdateSupplyReportTemplateDto;
        }) => helper.update(id, dto),
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
