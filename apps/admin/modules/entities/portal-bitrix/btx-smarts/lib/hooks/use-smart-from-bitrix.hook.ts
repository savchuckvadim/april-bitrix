import { usePortal } from "@/modules/entities/portal/hooks";
import { useQuery } from "@tanstack/react-query";
import { BitrixSmart } from "../api/bitrix-smart.helper";

export const useSmartFromBitrix = (portalId: number) => {
   const portal = usePortal(portalId);
   const bitrixSmart = new BitrixSmart(portal.data?.domain);
    const { data, isLoading } = useQuery({
        queryKey: ['smart-list'],
        queryFn: () => bitrixSmart.getAllSmarts(),
    });
    return {
        data,
        isLoading,
    };
}