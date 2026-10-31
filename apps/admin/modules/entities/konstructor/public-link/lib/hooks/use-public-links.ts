'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PUBLIC_LINK_LIST_CACHE_KEY } from '../../consts/public-link.consts';
import type { PublicLinkCreate } from '../../model';
import { PublicLinkHelper } from '../api/public-link.helper';

const helper = new PublicLinkHelper();

export const usePublicLinks = () =>
    useQuery({
        queryKey: [PUBLIC_LINK_LIST_CACHE_KEY],
        queryFn: () => helper.list(),
    });

/** Любая правка меняет список: статусы, счётчик действующих. */
const useInvalidateList = () => {
    const queryClient = useQueryClient();
    return () =>
        queryClient.invalidateQueries({ queryKey: [PUBLIC_LINK_LIST_CACHE_KEY] });
};

export const useCreatePublicLink = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (dto: PublicLinkCreate) => helper.create(dto),
        onSuccess: invalidate,
    });
};

export const useRevokePublicLink = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (id: string) => helper.revoke(id),
        onSuccess: invalidate,
    });
};

export const useRevokeAllPublicLinks = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: () => helper.revokeAll(),
        onSuccess: invalidate,
    });
};
