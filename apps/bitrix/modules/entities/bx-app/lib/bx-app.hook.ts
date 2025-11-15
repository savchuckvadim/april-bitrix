import { useMutation, useQuery } from "@tanstack/react-query";
import { BitrixAppDto, BitrixAppEntity, CreateBitrixAppDto, EnabledAppDto } from "@workspace/nest-api";
import { bxAppHelper } from "./bx-app.helper";
import { BitrixApp } from "../../entities";

export const useBxApps = (portalId: number) => {
    const { data: portalApps, isLoading, error } = useQuery<BitrixApp[], Error>({
        queryKey: ['bx-apps', portalId],
        enabled: !!portalId,
        queryFn: async (): Promise<BitrixApp[]> => {
            const response = await bxAppHelper.getPortalApps(portalId);
            return response?.map((app) => ({
                id: app.id as bigint,
                portal_id: app.portal_id as bigint,
                group: app.group as 'sales' | 'service' | 'marketing' | 'support' | 'analytics',
                type: app.type as 'widget' | 'webhook' | 'integration',
                code: app.code as string,
                status: app.status as 'not_installed' | 'installing' | 'installed' | 'error',
                createdAt: app.createdAt,
                updatedAt: app.updatedAt,
            }) as BitrixApp) ?? [];
        }
    });

    const { data: enabledApps, isLoading: isLoadingEnabledApps, error: errorEnabledApps } = useQuery<EnabledAppDto[], Error>({
        queryKey: ['bx-apps-enabled'],
        queryFn: async (): Promise<EnabledAppDto[]> => {
            const response = await bxAppHelper.getEnabledApps();
            return response ?? [];
        }
    });

    const { mutate: storeOrUpdateApp, isPending: isLoadingStoreOrUpdateApp, error: errorStoreOrUpdateApp } = useMutation<BitrixAppDto | null, Error, CreateBitrixAppDto>({
        mutationFn: async (app: CreateBitrixAppDto) => {
            const response = await bxAppHelper.storeOrUpdateApp(app);
            return response;
        }
    });

    return {
        portalApps,
        enabledApps,
        isLoading,
        isLoadingEnabledApps,
        error,
        errorEnabledApps,
        storeOrUpdateApp,
        isLoadingStoreOrUpdateApp,
        errorStoreOrUpdateApp,
    };
}
