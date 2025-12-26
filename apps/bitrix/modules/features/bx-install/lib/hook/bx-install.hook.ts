import { useEffect, useState } from "react";
import { bxInstallHelper, getInstallStatus, getPlacementList } from "../api/bx-install.helper";
import { useQuery } from "@tanstack/react-query";

export const useBxInstall = () => {
    console.log('useBxInstall');
    const bxReady = useBxReady();
    console.log('bxReady');
    console.log(bxReady);
    const query= useQuery<any, Error>({
        queryKey: ['install'],
        queryFn: bxInstallHelper,
        enabled: bxReady, // ❗ КРИТИЧНО
        retry: false,          // ❗ важно для install
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchInterval: false,
        refetchIntervalInBackground: false,

    });
    return {
        isInstalled: query.isSuccess,
        isLoading: query.isLoading,
        error: query.error,
    };
};


export const useBxReady = () => {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        if ((window as any).BX24) {
            setReady(true);
            return;
        }

        const interval = setInterval(() => {
            if ((window as any).BX24) {
                setReady(true);
                clearInterval(interval);
            }
        }, 50);

        return () => clearInterval(interval);
    }, []);

    return ready;
};
