'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
    TranscriptionSpendPortalDto,
    TranscriptionSpendSummaryDto,
} from '@workspace/nest-admin-api';
import { TranscriptionSpendHelper } from '../api/spend-helper';
import { TRANSCRIPTION_SPEND_CACHE_KEY } from '../../consts/spend.consts';

const helper = new TranscriptionSpendHelper();

/** Расход растёт в течение дня — минуту данные считаются свежими. */
const SPEND_STALE_MS = 60_000;

/** Расход по всем порталам за месяц. */
export const useTranscriptionSpendSummary = (month?: string) =>
    useQuery<TranscriptionSpendSummaryDto, Error>({
        queryKey: [TRANSCRIPTION_SPEND_CACHE_KEY, 'summary', month ?? ''],
        queryFn: () => helper.summary(month),
        placeholderData: keepPreviousData,
        staleTime: SPEND_STALE_MS,
    });

/** Расход одного портала за месяц. */
export const usePortalTranscriptionSpend = (domain: string, month?: string) =>
    useQuery<TranscriptionSpendPortalDto, Error>({
        queryKey: [TRANSCRIPTION_SPEND_CACHE_KEY, 'portal', domain, month ?? ''],
        queryFn: () => helper.portal(domain, month),
        enabled: Boolean(domain),
        placeholderData: keepPreviousData,
        staleTime: SPEND_STALE_MS,
    });
