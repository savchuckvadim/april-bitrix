'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PbxGroup } from '../../../lib/model/common';
import { GroupHelper } from '../api/group-helper';

const helper = new GroupHelper();
const KEY = ['pbx-group'] as const;

export const useGroupMonitoring = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, domain],
        queryFn: () => helper.getMonitoring(domain as string),
        enabled: !!domain,
    });

export const useInstallGroup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: { domain: string; group: PbxGroup }) =>
            helper.installGroup(vars.domain, vars.group),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};

/** Bind an existing Bitrix group id to a calling-group slot (PortalDB upsert). */
export const useSetCallingBitrixId = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (vars: {
            domain: string;
            group: PbxGroup;
            bitrixId: number;
        }) => helper.setCallingBitrixId(vars.domain, vars.group, vars.bitrixId),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEY }),
    });
};
