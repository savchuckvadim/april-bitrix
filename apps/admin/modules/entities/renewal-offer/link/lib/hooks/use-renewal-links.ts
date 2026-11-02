'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RENEWAL_LINK_LIST_CACHE_KEY } from '../../consts/renewal-link.consts';
import type { RenewalLinkCreate } from '../../model';
import { RenewalLinkHelper } from '../api/renewal-link.helper';

const helper = new RenewalLinkHelper();

export const useRenewalLinks = () =>
    useQuery({
        queryKey: [RENEWAL_LINK_LIST_CACHE_KEY],
        queryFn: () => helper.list(),
    });

/** Любая правка меняет список: статусы, счётчик действующих. */
const useInvalidateList = () => {
    const queryClient = useQueryClient();
    return () =>
        queryClient.invalidateQueries({
            queryKey: [RENEWAL_LINK_LIST_CACHE_KEY],
        });
};

export const useCreateRenewalLink = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (dto: RenewalLinkCreate) => helper.create(dto),
        onSuccess: invalidate,
    });
};

export const useRevokeRenewalLink = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (id: string) => helper.revoke(id),
        onSuccess: invalidate,
    });
};

export const useRevokeAllRenewalLinks = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: () => helper.revokeAll(),
        onSuccess: invalidate,
    });
};
