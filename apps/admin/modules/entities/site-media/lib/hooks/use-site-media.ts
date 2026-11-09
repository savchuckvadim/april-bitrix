'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PLATFORM_MEDIA_SECTION } from '@workspace/site-media';
import { SITE_MEDIA_CACHE_KEY } from '../../consts/site-media.consts';
import {
    SiteMediaHelper,
    type SiteMediaUploadParts,
    type SiteMediaUploadProgress,
} from '../api/site-media.helper';

const helper = new SiteMediaHelper();
const SECTION = PLATFORM_MEDIA_SECTION;
const LIST_KEY = [SITE_MEDIA_CACHE_KEY, SECTION] as const;

export const useSiteMediaList = () =>
    useQuery({
        queryKey: LIST_KEY,
        queryFn: () => helper.list(SECTION),
    });

/** Любая правка меняет список: превью, размеры, счётчики. */
const useInvalidateList = () => {
    const queryClient = useQueryClient();
    return () => queryClient.invalidateQueries({ queryKey: LIST_KEY });
};

export interface SiteMediaUploadVariables {
    slot: string;
    parts: SiteMediaUploadParts;
    onProgress?: SiteMediaUploadProgress;
}

export const useUploadSiteMedia = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: ({ slot, parts, onProgress }: SiteMediaUploadVariables) =>
            helper.upload(SECTION, slot, parts, onProgress),
        onSuccess: invalidate,
    });
};

export const useRemoveSiteMediaPoster = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (slot: string) => helper.removePoster(SECTION, slot),
        onSuccess: invalidate,
    });
};

export const useRemoveSiteMedia = () => {
    const invalidate = useInvalidateList();
    return useMutation({
        mutationFn: (slot: string) => helper.remove(SECTION, slot),
        onSuccess: invalidate,
    });
};
