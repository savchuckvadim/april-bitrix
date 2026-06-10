import { useQuery } from "@tanstack/react-query";
import { UpdatePortalRegionDto } from "../../model";
import { PortalRegionsHelper } from "../api";

/**
 * Хук для получения начальных данных для редактирования региона портала
 *
 * В useQuery параметры (portalId, regionId) должны быть переданы в хук,
 * потому что они используются:
 * - в queryKey для кеширования
 * - в queryFn для выполнения запроса
 * - в enabled для условного выполнения запроса
 */
export const useGetUpdateInitialDataPortalRegion = (portalId: number, regionId: number) => {
    const helper = new PortalRegionsHelper();

    return useQuery<
        UpdatePortalRegionDto,
        Error
    >({
        queryKey: ['initialDataPortalRegion', portalId, regionId],
        queryFn: async () => {
            if (!portalId || !regionId) {
                throw new Error('portalId and regionId are required');
            }
            const response = await helper.getUpdateInitialData(portalId, regionId);

            return response;
        },
        enabled: !!portalId && !!regionId,
    });
};
