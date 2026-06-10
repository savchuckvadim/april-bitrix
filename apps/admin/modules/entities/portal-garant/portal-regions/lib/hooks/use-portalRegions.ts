'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PortalRegionsHelper } from '../api/portalRegions-helper';
import {
    AdminPortalGarantRegionListParams,
    CreatePortalRegionDtoAdminRequest,
    DeletePortalRegionDto,
    GetPortalRegionResponseDto,
} from "../../model";
const helper = new PortalRegionsHelper();

export const usePortalRegions = (params?: AdminPortalGarantRegionListParams) => {
    return useQuery<GetPortalRegionResponseDto[], Error>({
        queryKey: ['portalRegions', params],
        queryFn: async () => {

            const response = await helper.getPortalRegions(
                params || ({} as Partial<AdminPortalGarantRegionListParams>) as AdminPortalGarantRegionListParams,
            );

            return response;
        },
        enabled: !!params,
    });
};

// export const usePortalContract = (id: number) => {
//     return useQuery<PortalContractResponseDto, Error>({
//         queryKey: ['portalContract', id],
//         queryFn: async () => {
//             const response = await portalContractHelper.getPortalContractById(id);
//             return response;
//         },
//         enabled: !!id,
//     });
// };

export const useCreatePortalRegion = () => {
    const queryClient = useQueryClient();

    return useMutation<GetPortalRegionResponseDto, Error, CreatePortalRegionDtoAdminRequest>({
        mutationFn: async (dto: CreatePortalRegionDtoAdminRequest) => {
            const response = await helper.createPortalRegion(dto);

            return response;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalRegions'] });
        },
    });
};


export const useDeletePortalRegion = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, DeletePortalRegionDto>({
        mutationFn: async (dto: DeletePortalRegionDto) => {
            await helper.deletePortalRegion(dto);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['portalRegions'] });
        },
    });
};

