'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    PortalContractGetAllPortalContractsParams,
    PortalContractResponseDto,
    CreatePortalContractDto,
    UpdatePortalContractDto
} from '@workspace/nest-api';
import { PortalContractHelper } from '../api/portalContracts-helper';

const portalContractHelper = new PortalContractHelper();

export const usePortalContracts = (params?: PortalContractGetAllPortalContractsParams) => {
    return useQuery<PortalContractResponseDto[], Error>({
        queryKey: ['portalContracts', params],
        queryFn: async () => {
            const response = await portalContractHelper.getPortalContracts(
                params || ({} as Partial<PortalContractGetAllPortalContractsParams>) as PortalContractGetAllPortalContractsParams,
            );
            return response;
        },
        enabled: !!params,
    });
};

export const usePortalContract = (id: number) => {
    return useQuery<PortalContractResponseDto, Error>({
        queryKey: ['portalContract', id],
        queryFn: async () => {
            const response = await portalContractHelper.getPortalContractById(id);
            return response;
        },
        enabled: !!id,
    });
};

export const useCreatePortalContract = () => {
    const queryClient = useQueryClient();

    return useMutation<PortalContractResponseDto, Error, CreatePortalContractDto>({
        mutationFn: async (dto: CreatePortalContractDto) => {
            const response = await portalContractHelper.createPortalContract(dto);
            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalContracts'] });
        },
    });
};

export const useUpdatePortalContract = () => {
    const queryClient = useQueryClient();

    return useMutation<
        PortalContractResponseDto,
        Error,
        { id: number; dto: UpdatePortalContractDto }
    >({
        mutationFn: async ({ id, dto }) => {
            const response = await portalContractHelper.updatePortalContract(id, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portalContracts'] });
            queryClient.invalidateQueries({
                queryKey: ['portalContract', variables.id],
            });
        },
    });
};

export const useDeletePortalContract = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, number>({
        mutationFn: async (id: number) => {
            await portalContractHelper.deletePortalContract(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalContracts'] });
        },
    });
};

