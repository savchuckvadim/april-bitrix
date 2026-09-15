'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app';
import {
    fetchAiAgenda,
    fetchAiAttention,
    fetchAiByType,
    fetchAiOverview,
    fetchAiPulse,
    type AiAnalyticsState,
    type AiSection,
    type AiSectionData,
} from '@/modules/entities/ai-analytics';

type LoadableSection = 'pulse' | 'agenda' | 'overview' | 'attention' | 'byType';

/** Секция стора по имени — типизированная таблица вместо приведения типов. */
const SELECT: {
    [K in LoadableSection]: (
        ai: AiAnalyticsState,
    ) => AiSection<AiSectionData[K]>;
} = {
    pulse: ai => ai.pulse,
    agenda: ai => ai.agenda,
    overview: ai => ai.overview,
    attention: ai => ai.attention,
    byType: ai => ai.byType,
};

/** Повтор после ошибки: синхронные — force-флагом, тяжёлые — force-опцией. */
const RETRY = {
    pulse: () => fetchAiPulse(true),
    agenda: () => fetchAiAgenda(true),
    overview: () => fetchAiOverview({ force: true }),
    attention: () => fetchAiAttention({ force: true }),
    byType: () => fetchAiByType({ force: true }),
} as const;

/** Секция данных вкладки + повтор запроса после ошибки. */
export const useAiSection = <S extends LoadableSection>(
    section: S,
): AiSection<AiSectionData[S]> & { retry: () => void } => {
    const dispatch = useAppDispatch();
    const state = useAppSelector(current =>
        SELECT[section](current.aiAnalytics),
    );
    return { ...state, retry: () => dispatch(RETRY[section]()) };
};
