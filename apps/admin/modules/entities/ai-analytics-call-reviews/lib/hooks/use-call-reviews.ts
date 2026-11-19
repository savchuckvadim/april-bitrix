'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CallReviewsPage, CallReviewsQuery } from '../../model';
import { CallReviewsHelper } from '../api/call-reviews-helper';

const helper = new CallReviewsHelper();

/** Префикс ключей кэша раздела «Отзывы о разборах». */
export const CALL_REVIEWS_KEY = ['ai-analytics-call-reviews'] as const;

/**
 * Страница отзывов. Нет параметров (портал не выбран, период неверный) —
 * запроса нет. При листании прежняя страница остаётся на экране, пока
 * грузится следующая; один повтор — на сетевой сбой, 400/403 повтором не
 * лечатся.
 */
export const useCallReviews = (query: CallReviewsQuery | null) =>
    useQuery<CallReviewsPage, Error>({
        queryKey: [...CALL_REVIEWS_KEY, query],
        queryFn: () => helper.page(query as CallReviewsQuery),
        enabled: query !== null,
        placeholderData: keepPreviousData,
        retry: 1,
    });
