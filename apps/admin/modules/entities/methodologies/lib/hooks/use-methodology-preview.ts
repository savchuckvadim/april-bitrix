'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { MethodologyPreviewHelper } from '../api/methodology-preview-helper';
import {
    METHODOLOGY_PREVIEW_TEXT,
    type MethodologyPreviewStart,
    type MethodologyPreviewState,
} from '../../model/methodology-preview';

const helper = new MethodologyPreviewHelper();
export const METHODOLOGY_PREVIEW_KEY = 'methodology-preview';

/** Как часто спрашивать состояние, пока проверка идёт, мс. */
const POLL_MS = 3000;

/** Проверка ещё не завершена — опрос продолжается. */
export const isPreviewPending = (
    state: MethodologyPreviewState | undefined,
): boolean => state?.status === 'queued' || state?.status === 'running';

/** Запуск проверки черновика на звонке. */
export const useStartMethodologyPreview = () =>
    useMutation({
        mutationFn: (body: MethodologyPreviewStart) => helper.start(body),
        onError: error =>
            toast.error(METHODOLOGY_PREVIEW_TEXT.startError, {
                description: getApiErrorMessage(error),
            }),
    });

/**
 * Состояние проверки: опрашивается, пока она в очереди или идёт, и
 * останавливается на итоге или отказе.
 */
export const useMethodologyPreviewState = (previewId: string | null) =>
    useQuery({
        queryKey: [METHODOLOGY_PREVIEW_KEY, previewId],
        queryFn: () => helper.state(previewId as string),
        enabled: previewId !== null,
        refetchInterval: query =>
            isPreviewPending(query.state.data) ? POLL_MS : false,
        retry: false,
    });
