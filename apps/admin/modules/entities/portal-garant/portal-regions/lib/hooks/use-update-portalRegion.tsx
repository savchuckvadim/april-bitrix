import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GetPortalRegionResponseDto, UpdatePortalRegionDto } from "../../model";
import { PortalRegionsHelper } from "../api/portalRegions-helper";

/**
 * Хук для обновления региона портала
 *
 * В useMutation параметры (portalId, regionId, dto) НЕ передаются в хук,
 * а передаются при вызове mutate():
 *
 * const { mutate } = useUpdatePortalRegion();
 * mutate({ portalId, regionId, dto });
 *
 * Это потому что мутации выполняются по требованию (on-demand),
 * а не автоматически при монтировании компонента.
 */
export const useUpdatePortalRegion = () => {
    const queryClient = useQueryClient();
    const helper = new PortalRegionsHelper();

    return useMutation<
        GetPortalRegionResponseDto,
        Error,
        { portalId: number; regionId: number; dto: UpdatePortalRegionDto }
    >({
        mutationFn: async ({ portalId, regionId, dto }) => {
            const response = await helper.updatePortalRegion(portalId, regionId, dto);
            return response;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['portalRegions'] });
            queryClient.invalidateQueries({
                queryKey: ['portalRegions', variables.portalId, variables.regionId],
            });
            queryClient.invalidateQueries({
                queryKey: ['initialDataPortalRegion', variables.portalId, variables.regionId],
            });
        },
    });
};
