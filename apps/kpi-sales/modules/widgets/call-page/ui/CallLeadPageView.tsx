'use client';

import type { CallPageDto } from '@/modules/entities/call-page';
import type { CallReviewLoad, CallReviewView } from '@/modules/entities/call-review';
import { CallReviewMarksContext } from '../model/call-review-marks.context';
import { useCallLeadReview } from '../model/use-call-lead-review';
import { CallPageView } from './CallPageView';
import { CallLeadNotice } from './review/CallLeadNotice';
import { CallLeadReviewBlock } from './review/CallLeadReviewBlock';
import { CallPageBackLink } from './review/CallPageBackLink';

interface CallLeadPageViewProps {
    data: CallPageDto;
    audioSrc: string;
    /** Ссылка-пропуск звонка и личный ключ — для сохранения отзыва. */
    token: string;
    lead: string;
    /** Блок отзывов с сервера Next: данные или текст, почему его нет. */
    review: CallReviewLoad;
    /** Пришли из списка разборов — вверху «← К списку разборов». */
    backToList: boolean;
}

interface CallLeadReviewPageProps extends Omit<CallLeadPageViewProps, 'review'> {
    view: CallReviewView;
}

/** Страница с действующим ключом: черновик, кнопки «Не так», сохранение. */
const CallLeadReviewPage = ({
    data,
    audioSrc,
    token,
    lead,
    view,
    backToList,
}: CallLeadReviewPageProps) => {
    const review = useCallLeadReview({ token, lead, initial: view });
    return (
        <CallReviewMarksContext.Provider value={review.marks}>
            <CallPageView
                data={data}
                audioSrc={audioSrc}
                topBar={backToList ? <CallPageBackLink /> : undefined}
                leftTop={<CallLeadReviewBlock review={review} aiScore={data.score.score} />}
            />
        </CallReviewMarksContext.Provider>
    );
};

/**
 * Личная страница разбора руководителя: та же страница звонка плюс блок
 * «Оценка руководителя» и кнопки «Не так» у пунктов разбора. Ключ
 * недействителен или срок истёк — страница звонка как обычная, вместо блока
 * строка с текстом бэка.
 */
export const CallLeadPageView = ({ review, ...props }: CallLeadPageViewProps) => {
    if (review.status === 'ok') {
        return <CallLeadReviewPage {...props} view={review.view} />;
    }
    return (
        <CallPageView
            data={props.data}
            audioSrc={props.audioSrc}
            topBar={props.backToList ? <CallPageBackLink /> : undefined}
            leftTop={<CallLeadNotice text={review.message} />}
        />
    );
};
