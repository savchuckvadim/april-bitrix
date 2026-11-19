'use client';

import { useState } from 'react';
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit';
import { usePortals } from '@/modules/entities/portal/hooks';
import { CALL_REVIEWS_DEFAULTS } from '../../../consts/call-reviews.const';
import { useCallReviews } from '../../../lib/hooks/use-call-reviews';
import {
    defaultReviewsPeriod,
    isValidReviewsPeriod,
    toCallReviewsQuery,
} from '../../../lib/call-reviews-query.util';
import {
    ANY_ITEM_KIND,
    type CallReviewsAgree,
    type CallReviewsFilters,
    type CallReviewsItemKindFilter,
} from '../../../model';

/**
 * Логика страницы «Отзывы о разборах»: портал, период (по умолчанию 30
 * дней), фильтры согласия и вида «не так», номер страницы. Любая смена
 * фильтра возвращает на первую страницу.
 */
export const useCallReviewsPanel = () => {
    const [filters, setFilters] = useState<CallReviewsFilters>(() => ({
        domain: undefined,
        period: defaultReviewsPeriod(new Date(), CALL_REVIEWS_DEFAULTS.periodDays),
        agree: 'all',
        itemKind: ANY_ITEM_KIND,
    }));
    const [page, setPage] = useState(1);
    const { data: portals } = usePortals();

    const query = toCallReviewsQuery(filters, page, CALL_REVIEWS_DEFAULTS.pageSize);
    const reviews = useCallReviews(query);

    const change = (next: Partial<CallReviewsFilters>) => {
        setFilters(prev => ({ ...prev, ...next }));
        setPage(1);
    };

    return {
        form: {
            filters,
            portalOptions: toPortalOptions(portals),
            isPeriodValid: isValidReviewsPeriod(filters.period),
        },
        actions: {
            selectDomain: (domain: string | undefined) => change({ domain }),
            setFrom: (from: string) => change({ period: { ...filters.period, from } }),
            setTo: (to: string) => change({ period: { ...filters.period, to } }),
            setAgree: (agree: CallReviewsAgree) => change({ agree }),
            setItemKind: (itemKind: CallReviewsItemKindFilter) => change({ itemKind }),
            setPage,
        },
        reviews,
    };
};

export type CallReviewsPanelState = ReturnType<typeof useCallReviewsPanel>;
