'use client';

import { useCallback } from 'react';
import type { Tone } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
import {
    aiCallTypeLabel,
    aiCallTypeTone,
} from '@/modules/entities/ai-analytics';

interface AiCallTypeBadge {
    label: string;
    tone: Tone;
}

/**
 * Подпись и тон бэйджа типа звонка по карте алфавитов портала
 * (settings.callTypes); нет карты — фолбэк-подписи сущности.
 */
export const useAiCallTypeBadge = () => {
    const callTypes = useAppSelector(
        state => state.aiAnalytics.settings.data?.callTypes,
    );
    return useCallback(
        (code: string | null | undefined): AiCallTypeBadge => ({
            label: aiCallTypeLabel(code, callTypes),
            tone: aiCallTypeTone(code, callTypes),
        }),
        [callTypes],
    );
};
