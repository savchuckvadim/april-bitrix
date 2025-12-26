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
        console.log('useBxReady in effect');
        if (typeof window === 'undefined') return;
        console.log('useBxReady in effect window');
        if ((window as any).BX24) {
            console.log('useBxReady in effect BX24');
            setReady(true);
            return;
        }
        console.log('useBxReady in effect not BX24');
        const interval = setInterval(() => {
            if ((window as any).BX24) {
                setReady(true);
                clearInterval(interval);
            }
        }, 150);

        return () => clearInterval(interval);
    }, []);
    console.log('useBxReady return');
    console.log(ready);
    return ready;
};
