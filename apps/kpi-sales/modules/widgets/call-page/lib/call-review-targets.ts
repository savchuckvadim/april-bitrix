/**
 * Пункты страницы разбора, к которым руководитель может оставить «не так»:
 * раздел, возражение, пункт методики, тип звонка. Кодов у пунктов на
 * странице нет (id подсветок — порядковые, между разборами не совпадают),
 * поэтому ref — название пункта: оно и узнаётся в отзыве, и читается в
 * админке. Пределы длины — как у бэка.
 */
import {
    CALL_REVIEW_KIND_TEXT,
    CALL_REVIEW_LIMITS,
    type CallReviewItemKind,
    type CallReviewTarget,
} from '@/modules/entities/call-review';
import type {
    CallPageCallDto,
    CallPageCheckpointDto,
    CallPageObjectionDto,
    CallPageSectionDto,
} from '@/modules/entities/call-page';

const clip = (text: string, max: number): string => {
    const value = text.trim();
    return value.length > max ? value.slice(0, max) : value;
};

const target = (
    kind: CallReviewItemKind,
    ref: string,
    label: string,
): CallReviewTarget => ({
    kind,
    ref: clip(ref, CALL_REVIEW_LIMITS.itemRef),
    label: clip(label, CALL_REVIEW_LIMITS.itemLabel),
});

export const sectionReviewTarget = (
    section: Pick<CallPageSectionDto, 'title'>,
): CallReviewTarget =>
    target('section', section.title, section.title);

export const objectionReviewTarget = (
    objection: Pick<CallPageObjectionDto, 'categoryTitle' | 'text'>,
): CallReviewTarget => {
    const title = `${objection.categoryTitle}: ${objection.text}`;
    return target('objection', title, title);
};

export const checkpointReviewTarget = (
    checkpoint: Pick<CallPageCheckpointDto, 'title'>,
): CallReviewTarget => target('methodology', checkpoint.title, checkpoint.title);

/** Тип звонка; типа нет — отмечать нечего, null. */
export const callTypeReviewTarget = (
    call: Pick<CallPageCallDto, 'callTypeTitle'>,
): CallReviewTarget | null =>
    call.callTypeTitle
        ? target(
              'call_type',
              call.callTypeTitle,
              `${CALL_REVIEW_KIND_TEXT.call_type}: ${call.callTypeTitle}`,
          )
        : null;
