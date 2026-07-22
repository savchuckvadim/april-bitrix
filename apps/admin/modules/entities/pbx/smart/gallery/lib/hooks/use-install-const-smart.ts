'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../../../../lib/api-error';
import { SmartsAdminHelper } from '../../../db/lib/api/smarts-admin-helper';
import { DB_SMARTS_KEY } from '../../../db/lib/hooks';

const adminHelper = new SmartsAdminHelper();

/**
 * Идемпотентная установка const-смарта по `kind` из реестра (паттерн
 * `useInstallAicall`). После успеха инвалидируются смарты портала и
 * мониторинг pbx-install — галерея и аккордеон перечитывают статус.
 */
export const useInstallConstSmart = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { kind: string; domain: string }) =>
            adminHelper.installConst(vars.kind, vars.domain),
        onSuccess: () => {
            toast.success('Смарт установлен');
            void queryClient.invalidateQueries({ queryKey: DB_SMARTS_KEY });
            void queryClient.invalidateQueries({ queryKey: ['pbx-process'] });
        },
        onError: (e) => toast.error(getApiErrorMessage(e)),
    });
};
