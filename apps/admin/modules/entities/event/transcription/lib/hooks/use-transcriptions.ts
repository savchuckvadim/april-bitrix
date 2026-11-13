'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    AdminTranscriptionStoreFindPageParams,
    TranscriptionAdminFacetsDto,
    TranscriptionAdminPageDto,
} from '@workspace/nest-admin-api';
import { TranscriptionEntity } from '../../model';
import { TranscriptionHelper } from '../api/transcription-helper';
import { TRANSCRIPTION_LIST_CACHE_KEY } from '../../consts/transcription.consts';

const helper = new TranscriptionHelper();

/** Значения фильтров меняются медленно — пять минут без повторного запроса. */
const FACETS_STALE_MS = 5 * 60_000;

/**
 * Страница транскрипций (свежие первыми). Раньше список тянул все записи
 * с текстами разом и вешал вкладку (13.11.2026). Прошлая страница держится,
 * пока грузится следующая.
 */
export const useTranscriptionPage = (params: AdminTranscriptionStoreFindPageParams) => {
    return useQuery<TranscriptionAdminPageDto, Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, 'page', params],
        queryFn: () => helper.page(params),
        placeholderData: keepPreviousData,
    });
};

/** Значения для фильтров списка: по всем порталам или по одному. */
export const useTranscriptionFacets = (domain?: string) => {
    return useQuery<TranscriptionAdminFacetsDto, Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, 'facets', domain ?? ''],
        queryFn: () => helper.facets(domain),
        staleTime: FACETS_STALE_MS,
    });
};

/** Одна транскрипция целиком — для карточки. */
export const useTranscription = (id: string) => {
    return useQuery<TranscriptionEntity, Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, id],
        queryFn: () => helper.get(id),
        enabled: !!id,
    });
};
