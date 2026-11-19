'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import {
    CALL_REVIEW_LIMITS,
    CALL_REVIEW_TEXT,
    formatCallReviewMoment,
} from '@/modules/entities/call-review';
import type { CallLeadReviewState } from '../../model/use-call-lead-review';
import { CallLeadNotice } from './CallLeadNotice';
import { CallReviewAgreeField } from './CallReviewAgreeField';
import { CallReviewColleagues } from './CallReviewColleagues';
import { CallReviewCommentField } from './CallReviewCommentField';
import { CallReviewItemsList } from './CallReviewItemsList';
import { CallReviewSaveBar } from './CallReviewSaveBar';
import { CallReviewScorePicker } from './CallReviewScorePicker';

const T = CALL_REVIEW_TEXT;

interface CallLeadReviewBlockProps {
    review: CallLeadReviewState;
    /** Оценка AI звонка 1–10 — в вопросе «Согласны ли». */
    aiScore: number | null;
}

/**
 * «Оценка руководителя» вверху левой колонки: согласен ли с оценкой AI,
 * своя оценка 1–10, большой комментарий, отмеченные «не так» пункты,
 * «Сохранить»; ниже — отзывы коллег. Без права на отзыв — только строка
 * «Оставить отзыв может руководитель этого сотрудника».
 */
export const CallLeadReviewBlock = ({ review, aiScore }: CallLeadReviewBlockProps) => {
    const { view, draft, edit, save, submit, changed } = review;
    if (!view.viewer.canReview) return <CallLeadNotice text={T.noRight} />;

    const expires = formatCallReviewMoment(view.viewer.expiresAt);
    return (
        <SectionCard
            title={T.block.title}
            description={T.block.description}
            accent
            tone="primary"
            footer={
                expires ? (
                    <span className="text-xs text-muted-foreground">{T.expiresAt(expires)}</span>
                ) : undefined
            }
        >
            <div className="space-y-4">
                <CallReviewAgreeField
                    aiScore={aiScore}
                    value={draft.agree}
                    onChange={agree => edit({ type: 'agree', agree })}
                />
                <CallReviewScorePicker
                    value={draft.leaderScore}
                    onChange={score => edit({ type: 'score', score })}
                />
                <CallReviewCommentField
                    value={draft.comment}
                    onChange={comment => edit({ type: 'comment', comment })}
                />
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                        {T.items.title}
                        {draft.items.length > 0 &&
                            ` · ${draft.items.length} из ${CALL_REVIEW_LIMITS.items}`}
                    </h3>
                    <CallReviewItemsList
                        items={draft.items}
                        emptyText={T.items.empty}
                        onRemove={item => edit({ type: 'unmark', target: item })}
                    />
                </div>
                <CallReviewSaveBar
                    save={save}
                    savedAt={view.mine?.createdAt ?? null}
                    unchanged={view.mine !== null && !changed}
                    onSave={() => void submit()}
                />
                <CallReviewColleagues reviews={view.colleagues} />
            </div>
        </SectionCard>
    );
};
