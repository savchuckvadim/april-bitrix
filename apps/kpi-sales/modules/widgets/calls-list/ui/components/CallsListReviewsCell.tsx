import { ToneBadge } from '@workspace/april-ui/badges';
import {
    CALLS_LIST_TEXT,
    callsListReviewsView,
    type CallsListReviews,
} from '@/modules/entities/calls-list';

/**
 * Отзывы руководителей в строке: сколько («не оценён»), мой отзыв
 * («мой: 7, согласен»), несогласие с оценкой AI — пометкой; средняя оценка
 * руководителей — подсказкой.
 */
export const CallsListReviewsCell = ({ reviews }: { reviews: CallsListReviews }) => {
    const view = callsListReviewsView(reviews);
    return (
        <div className="space-y-0.5 text-xs" title={view.average ?? undefined}>
            <div className="flex flex-wrap items-center gap-1">
                <span className={reviews.count > 0 ? 'font-medium' : 'text-muted-foreground'}>
                    {view.count}
                </span>
                {view.disagree && (
                    <ToneBadge
                        tone="destructive"
                        variant="soft"
                        size="sm"
                        title={CALLS_LIST_TEXT.reviews.disagreeTitle}
                    >
                        {view.disagree}
                    </ToneBadge>
                )}
            </div>
            {view.mine && <p className="text-muted-foreground">{view.mine}</p>}
        </div>
    );
};
