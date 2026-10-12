'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY } from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';
import type { ICreateSupplyReportTemplateDto } from '../../model';

const helper = new SupplyReportTemplateHelper();

export const useCreateSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: ICreateSupplyReportTemplateDto) => helper.create(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY],
            });
        },
    });
};
