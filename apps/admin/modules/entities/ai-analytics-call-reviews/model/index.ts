/**
 * Типы раздела «AI-аналитика → Отзывы о разборах»: ответ ручки
 * `GET /api/admin/ai-analytics/call-reviews` (`Sales AI Analytics Admin`)
 * и состояние фильтров страницы.
 */
import type {
    AiAnalyticsCallReviewsAdminListAgree,
    AiAnalyticsCallReviewsAdminListItemKind,
    AiAnalyticsCallReviewsAdminListParams,
    CallReviewAdminItemDto,
    CallReviewAdminRowDto,
    CallReviewsAdminPageDto,
    CallReviewsAdminSummaryDto,
} from '@workspace/nest-admin-api';

export type CallReviewsPage = CallReviewsAdminPageDto;
export type CallReviewRow = CallReviewAdminRowDto;
export type CallReviewItem = CallReviewAdminItemDto;
export type CallReviewsSummary = CallReviewsAdminSummaryDto;
export type CallReviewsQuery = AiAnalyticsCallReviewsAdminListParams;
export type CallReviewsAgree = AiAnalyticsCallReviewsAdminListAgree;
export type CallReviewsItemKind = AiAnalyticsCallReviewsAdminListItemKind;

/** «Не так» любого вида — фильтр не задан. */
export const ANY_ITEM_KIND = 'any';
export type CallReviewsItemKindFilter = CallReviewsItemKind | typeof ANY_ITEM_KIND;

/** Период: даты YYYY-MM-DD включительно (по Москве). */
export interface CallReviewsPeriod {
    from: string;
    to: string;
}

/** Фильтры страницы. */
export interface CallReviewsFilters {
    domain: string | undefined;
    period: CallReviewsPeriod;
    agree: CallReviewsAgree;
    itemKind: CallReviewsItemKindFilter;
}
