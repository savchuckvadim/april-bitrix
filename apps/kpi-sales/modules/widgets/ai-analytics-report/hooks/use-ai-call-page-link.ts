'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/modules/app';
import { selectAiRequester } from '@/modules/entities/ai-analytics';
import { fetchAiCallPageLinks } from '@/modules/entities/ai-analytics/lib/api/ai-call-page-links-helper';
import {
    createCallPageLinkBatcher,
    type CallPageLinkBatcher,
} from '@/modules/entities/ai-analytics/lib/ai-call-page-links.batcher';

/**
 * Загрузчики по пользователю портала: ссылки зависят от того, чьи звонки
 * ему видны, поэтому у каждого пользователя свой запомненный набор.
 */
const batchers = new Map<string, CallPageLinkBatcher>();

const batcherOf = (domain: string, requesterUserId: string): CallPageLinkBatcher => {
    const key = `${domain}:${requesterUserId}`;
    let batcher = batchers.get(key);
    if (!batcher) {
        batcher = createCallPageLinkBatcher(ids =>
            fetchAiCallPageLinks({ domain, requesterUserId }, ids),
        );
        batchers.set(key, batcher);
    }
    return batcher;
};

/**
 * Ссылка на страницу разбора звонка для строки списка; null — пока грузится
 * или ссылки нет. Строки одного списка получают ссылки одним запросом.
 */
export const useAiCallPageLink = (
    transcriptionId: string | null | undefined,
): string | null => {
    const requester = useAppSelector(selectAiRequester);
    const domain = requester?.domain ?? null;
    const requesterUserId = requester?.requesterUserId ?? null;
    const [link, setLink] = useState<{ id: string; url: string } | null>(null);

    useEffect(() => {
        if (!transcriptionId || !domain || !requesterUserId) return;
        let alive = true;
        void batcherOf(domain, requesterUserId)
            .get(transcriptionId)
            .then(url => {
                if (alive && url) setLink({ id: transcriptionId, url });
            });
        return () => {
            alive = false;
        };
    }, [transcriptionId, domain, requesterUserId]);

    // Ссылка прошлого звонка этой же строки не показывается у нового.
    return link && link.id === transcriptionId ? link.url : null;
};
