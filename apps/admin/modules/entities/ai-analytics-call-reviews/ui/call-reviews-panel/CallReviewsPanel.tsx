'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { ListPager } from '@/modules/shared/ui/list-pager';
import { CALL_REVIEWS_TEXT } from '../../consts/call-reviews.const';
import { CallReviewsFilters } from './components/CallReviewsFilters';
import { CallReviewsSummary } from './components/CallReviewsSummary';
import { CallReviewsTable } from './components/CallReviewsTable';
import { useCallReviewsPanel } from './hooks/use-call-reviews-panel';

/**
 * Раздел «AI-аналитика → Отзывы о разборах»: что руководители думают о
 * разборах звонков — сводка за период и таблица отзывов постранично.
 * Только чтение; отзыв оставляют на личной странице разбора.
 */
export const CallReviewsPanel = () => {
    const { form, actions, reviews } = useCallReviewsPanel();
    const data = reviews.data;

    return (
        <div className="w-full min-w-0 max-w-full space-y-4">
            <h1 className="text-3xl font-bold">{CALL_REVIEWS_TEXT.pageTitle}</h1>
            <CallReviewsFilters form={form} actions={actions} />

            {!form.filters.domain && (
                <p className="text-sm text-muted-foreground">{CALL_REVIEWS_TEXT.pickPortal}</p>
            )}
            {reviews.isError && (
                <p className="text-sm text-destructive">
                    {CALL_REVIEWS_TEXT.loadError}: {reviews.error.message}
                </p>
            )}

            {data && <CallReviewsSummary summary={data.summary} />}

            {form.filters.domain && (
                <SectionCard title={CALL_REVIEWS_TEXT.tableTitle} contentClassName="space-y-3">
                    {data && (
                        <ListPager
                            page={data.page}
                            pageSize={data.pageSize}
                            total={data.total}
                            loading={reviews.isFetching}
                            onChange={actions.setPage}
                        />
                    )}
                    <div className="w-full min-w-0 max-w-full overflow-x-auto">
                        <CallReviewsTable rows={data?.items ?? []} isLoading={reviews.isLoading} />
                    </div>
                </SectionCard>
            )}
        </div>
    );
};
