'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    SUPPLY_REPORT_TEMPLATE_ITEM_CASH_KEY,
    SUPPLY_REPORT_TEMPLATE_LIST_CASH_KEY,
} from '../../consts/supply-report-template.consts';
import { SupplyReportTemplateHelper } from '../api/supply-report-template.helper';

const helper = new SupplyReportTemplateHelper();

/**
 * Архивация / разархивация.
 *
 * Архивация снимает `is_default` (иначе область «по умолчанию» указывала бы
 * на строку, которой подбор не видит), а разархивация флаг НЕ возвращает —
 * его нужно выставить заново вручную.
 */
export const useArchiveSupplyReportTemplate = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
            archived ? helper.archive(id) : helper.unarchive(id),
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
