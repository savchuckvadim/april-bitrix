'use client';

import { MicroSegmented } from '@workspace/april-ui/fields';
import { CALL_REVIEW_TEXT } from '@/modules/entities/call-review';
import { formatScore } from '@/modules/entities/call-page';

const T = CALL_REVIEW_TEXT.agree;
const YES = 'yes';
const NO = 'no';

/** Классы активного «Да» / «Нет» — литералами целиком (Tailwind). */
const OPTIONS = [
    { value: YES, label: T.yes, activeClass: 'bg-success/15 font-medium text-success shadow-sm' },
    { value: NO, label: T.no, activeClass: 'bg-destructive/15 font-medium text-destructive shadow-sm' },
];

interface CallReviewAgreeFieldProps {
    /** Оценка AI звонка 1–10; null — оценки нет. */
    aiScore: number | null;
    value: boolean | null;
    onChange: (agree: boolean) => void;
}

/** «Согласны с оценкой AI (N из 10)?» — Да / Нет. */
export const CallReviewAgreeField = ({
    aiScore,
    value,
    onChange,
}: CallReviewAgreeFieldProps) => {
    const question =
        aiScore === null ? T.questionNoScore : T.question(formatScore(aiScore));
    return (
        <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">{question}</span>
            <MicroSegmented
                ariaLabel={question}
                options={OPTIONS}
                value={value === null ? undefined : value ? YES : NO}
                onChange={next => onChange(next === YES)}
            />
        </div>
    );
};
