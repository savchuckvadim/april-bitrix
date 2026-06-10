import { usePortalRegionsList } from "./use-portalRegionsList";

export const usePortalRegionDetails = (portalId: number, regionId: number) => {

    const { regions, isLoading } = usePortalRegionsList(portalId);

    const region = regions?.find(region => Number(region.id) === Number(regionId));

    return { region, isLoading };
};
