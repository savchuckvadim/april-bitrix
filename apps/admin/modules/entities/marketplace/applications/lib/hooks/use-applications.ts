'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    ApplicationDto,
    ApprovalActionDto,
    ApprovalResultDto,
    InstallComponentDto,
    PbxActionResultDto,
    PortalProductDto,
} from '@workspace/nest-admin-api';
import { getErrorMessage } from '../../../shared';
import { ApplicationsHelper } from '../api/applications-helper';

const helper = new ApplicationsHelper();

export const applicationsKeys = {
    list: (approvalStatus?: string) =>
        ['marketplace-applications', approvalStatus ?? 'all'] as const,
    all: ['marketplace-applications'] as const,
    components: (portalId: string) =>
        ['marketplace-application-components', portalId] as const,
    products: (portalId: string) =>
        ['marketplace-application-products', portalId] as const,
};

/** Список заявок с фильтром по статусу допуска. */
export const useApplications = (approvalStatus?: string) => {
    return useQuery<ApplicationDto[], Error>({
        queryKey: applicationsKeys.list(approvalStatus),
        queryFn: () => helper.list(approvalStatus),
    });
};

/** Одна заявка (ищется в общем списке по portalId — отдельной ручки нет). */
export const useApplication = (portalId: string) => {
    return useQuery<ApplicationDto | undefined, Error>({
        queryKey: ['marketplace-application', portalId],
        queryFn: async () => {
            const items = await helper.list();
            return items.find((item) => String(item.portalId) === String(portalId));
        },
        enabled: !!portalId,
    });
};

/** Компоненты установки портала. */
export const useApplicationComponents = (portalId: string) => {
    return useQuery<InstallComponentDto[], Error>({
        queryKey: applicationsKeys.components(portalId),
        queryFn: () => helper.components(Number(portalId)),
        enabled: !!portalId,
    });
};

/** Продукты портала. */
export const usePortalProducts = (portalId: string) => {
    return useQuery<PortalProductDto[], Error>({
        queryKey: applicationsKeys.products(portalId),
        queryFn: () => helper.products(Number(portalId)),
        enabled: !!portalId,
    });
};

const invalidatePortal = (
    queryClient: ReturnType<typeof useQueryClient>,
    portalId: string,
) => {
    queryClient.invalidateQueries({ queryKey: applicationsKeys.all });
    queryClient.invalidateQueries({ queryKey: ['marketplace-application', portalId] });
    queryClient.invalidateQueries({ queryKey: applicationsKeys.components(portalId) });
    queryClient.invalidateQueries({ queryKey: applicationsKeys.products(portalId) });
};

/** Решение модератора по заявке (approve | block). */
export const useDecideApplication = () => {
    const queryClient = useQueryClient();

    return useMutation<
        ApprovalResultDto,
        Error,
        { portalId: string; dto: ApprovalActionDto }
    >({
        mutationFn: ({ portalId, dto }) => helper.decide(Number(portalId), dto),
        onSuccess: (result, { portalId, dto }) => {
            invalidatePortal(queryClient, portalId);
            toast.success(
                dto.action === 'approve'
                    ? 'Портал одобрен, установка сущностей запущена'
                    : 'Портал заблокирован',
                result.provisionJobId
                    ? { description: `Задача provisioning: ${result.provisionJobId}` }
                    : undefined,
            );
        },
        onError: (error) => {
            toast.error('Не удалось применить решение', {
                description: getErrorMessage(error),
            });
        },
    });
};

/** Повторный запуск provisioning pbx-сущностей портала. */
export const useProvisionRefresh = () => {
    const queryClient = useQueryClient();

    return useMutation<PbxActionResultDto, Error, string>({
        mutationFn: (portalId) => helper.provisionRefresh(Number(portalId)),
        onSuccess: (result, portalId) => {
            invalidatePortal(queryClient, portalId);
            toast.success('Переустановка сущностей запущена', {
                description: result.details,
            });
        },
        onError: (error) => {
            toast.error('Не удалось запустить переустановку сущностей', {
                description: getErrorMessage(error),
            });
        },
    });
};

/** Diff-синхронизация привязок виджетов портала. */
export const usePlacementsRefresh = () => {
    const queryClient = useQueryClient();

    return useMutation<PbxActionResultDto, Error, string>({
        mutationFn: (portalId) => helper.placementsRefresh(Number(portalId)),
        onSuccess: (result, portalId) => {
            invalidatePortal(queryClient, portalId);
            toast.success('Синхронизация виджетов выполнена', {
                description: result.details,
            });
        },
        onError: (error) => {
            toast.error('Не удалось синхронизировать виджеты', {
                description: getErrorMessage(error),
            });
        },
    });
};
