'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UpdatePortalDepartamentDto } from '@workspace/nest-pbx-install-api';
import type { PbxGroup } from '../../../lib/model/common';
import type {
    CreatePortalDepartamentInput,
    UpdatePortalDepartamentInput,
} from '../model/departament';
import { DepartamentHelper } from '../api/departament-helper';

const helper = new DepartamentHelper();
const KEY = ['pbx-departament'] as const;

export const useDepartamentMonitoring = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, domain],
        queryFn: () => helper.getMonitoring(domain as string),
        enabled: !!domain,
    });

export const useBitrixDepartments = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, 'bitrix', domain],
        queryFn: () => helper.getBitrixDepartments(domain as string),
        enabled: !!domain,
    });

/** PortalDB `departaments` rows of one portal (full DB CRUD controller). */
export const usePortalDepartaments = (portalId?: number) =>
    useQuery({
        queryKey: [...KEY, 'db', portalId],
        queryFn: () => helper.listDbByPortal(portalId as number),
        enabled: !!portalId,
    });

const useInvalidate = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: KEY });
};

export const useInstallDepartament = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (vars: { domain: string; group: PbxGroup; bitrixId: number }) =>
            helper.installDepartament(vars.domain, vars.group, vars.bitrixId),
        onSuccess: invalidate,
    });
};

export const useUpdateDepartament = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (vars: { id: number; dto: UpdatePortalDepartamentDto }) =>
            helper.update(vars.id, vars.dto),
        onSuccess: invalidate,
    });
};

export const useDeleteDepartament = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (id: number) => helper.remove(id),
        onSuccess: invalidate,
    });
};

/* --- Full DB CRUD mutations (`pbx/portal-departament`) --- */

export const useCreateDepartamentDb = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (dto: CreatePortalDepartamentInput) => helper.createDb(dto),
        onSuccess: invalidate,
    });
};

export const useUpdateDepartamentDb = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (vars: { id: number; dto: UpdatePortalDepartamentInput }) =>
            helper.updateDb(vars.id, vars.dto),
        onSuccess: invalidate,
    });
};

export const useDeleteDepartamentDb = () => {
    const invalidate = useInvalidate();
    return useMutation({
        mutationFn: (id: number) => helper.removeDb(id),
        onSuccess: invalidate,
    });
};