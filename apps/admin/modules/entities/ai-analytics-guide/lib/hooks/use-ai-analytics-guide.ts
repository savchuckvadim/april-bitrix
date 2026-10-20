'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { GUIDE_STALE_MS } from '../../consts/ai-analytics-guide.const';
import { AiAnalyticsGuideHelper } from '../api/ai-analytics-guide-helper';
import type { GuideActionPayload } from '../guide-actions';

const helper = new AiAnalyticsGuideHelper();

/** Общий префикс ключей кэша путеводителя. */
export const AI_ANALYTICS_GUIDE_KEY = ['ai-analytics-guide'] as const;

/** Оглавление разделов (статический каталог бэка). */
export const useGuideSections = () =>
    useQuery({
        queryKey: [...AI_ANALYTICS_GUIDE_KEY, 'sections'],
        queryFn: () => helper.listSections(),
        staleTime: GUIDE_STALE_MS,
    });

/** Раздел по коду; 404 ретраями не лечится. */
export const useGuideSection = (code: string | undefined) =>
    useQuery({
        queryKey: [...AI_ANALYTICS_GUIDE_KEY, 'section', code ?? ''],
        queryFn: () => helper.getSection(code as string),
        enabled: !!code,
        staleTime: GUIDE_STALE_MS,
        retry: false,
    });

/** Выполнение действия формы «Запуск»; ответ показывается как есть. */
export const useRunGuideAction = () =>
    useMutation({
        mutationFn: (payload: GuideActionPayload) => helper.runAction(payload),
    });
