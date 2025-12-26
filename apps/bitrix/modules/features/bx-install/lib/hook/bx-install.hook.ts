import { useState } from "react";
import { bxInstallHelper, getInstallStatus, getPlacementList } from "../api/bx-install.helper";
import { useQuery } from "@tanstack/react-query";

export const useBxInstall = () => {


    const query= useQuery<any, Error>({
        queryKey: ['install'],
        queryFn: bxInstallHelper,
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
