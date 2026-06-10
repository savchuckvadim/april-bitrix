'use client';

import { useQuery } from '@tanstack/react-query';
import { TranscriptionEntity } from '../../model';
import { TranscriptionHelper } from '../api/transcription-helper';
import { TRANSCRIPTION_LIST_CACHE_KEY } from '../../consts/transcription.consts';

const helper = new TranscriptionHelper();

/**
 * Хук для получения всех транскрипций
 */
export const useTranscriptions = () => {
    return useQuery<TranscriptionEntity[], Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY],
        queryFn: async () => {
            const response = await helper.list();
            return response;
        },
    });
};

/**
 * Хук для получения транскрипций по домену (порталу)
 */
export const useTranscriptionsByDomain = (domain: string) => {
    return useQuery<TranscriptionEntity[], Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, 'domain', domain],
        queryFn: async () => {
            const response = await helper.findByDomain(domain);
            return response;
        },
        enabled: !!domain,
    });
};

/**
 * Хук для получения транскрипций по домену и пользователю
 */
export const useTranscriptionsByDomainAndUser = (domain: string, userId: string) => {
    return useQuery<TranscriptionEntity[], Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, 'domain', domain, 'user', userId],
        queryFn: async () => {
            const response = await helper.findByDomainAndUser(domain, userId);
            return response;
        },
        enabled: !!domain && !!userId,
    });
};

/**
 * Хук для получения одной транскрипции по ID
 */
export const useTranscription = (id: string) => {
    return useQuery<TranscriptionEntity, Error>({
        queryKey: [TRANSCRIPTION_LIST_CACHE_KEY, id],
        queryFn: async () => {
            const response = await helper.get(id);
            return response;
        },
        enabled: !!id,
    });
};
