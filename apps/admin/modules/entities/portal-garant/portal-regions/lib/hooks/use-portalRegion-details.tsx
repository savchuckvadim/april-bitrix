import { usePortalRegions } from './use-portalRegions';

export const usePortalRegionDetails = (portalId: number, regionId: number) => {
    const { data: regions, isLoading } = usePortalRegions({ portalId });
    const region = regions?.find(item => Number(item.id) === regionId);

    return { region, isLoading };
};
