'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY,
    SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

/** Снимает флаг «по умолчанию» у остальных шаблонов той же области. */
export const useSetDefaultSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => helper.setDefault(id, true),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY],
            });
            queryClient.invalidateQueries({
                queryKey: [SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY, id],
            });
        },
    });
};
