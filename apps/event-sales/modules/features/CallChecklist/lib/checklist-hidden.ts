import type { Portal } from '@workspace/pbx';
// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import type { QuestionnaireChannel } from '@/modules/entities/Questionnaire/model/questionnaire.type';

import type { ChecklistDef } from '../type/call-checklist.type';
import {
    checklistFieldRefs,
    resolveChecklistFieldDetailed,
    type ChecklistEntityRows,
    type HiddenChecklistReason,
} from './checklist-values';

/**
 * Вопросы анкеты, которых менеджер НЕ увидит, и почему.
 *
 * Зачем отдельным перечислителем, а не «прямо в резолве»: резолв обязан
 * остаться чистой функцией — его зовут селекторы, то есть по несколько раз
 * на рендер, и любой побочный эффект внутри превратился бы в поток. Здесь
 * побочных эффектов тоже нет: это ещё одна чистая функция, ЧТО считать.
 * Кто и когда считает — решает вызывающий (см. ChecklistHiddenThunk), и
 * решает он это один раз на появление анкеты, а не на каждый рендер.
 */

export interface HiddenChecklistQuestion {
    /** `${код анкеты}:${код вопроса}` — им же дедуплицируется отчёт. */
    answerKey: string;
    /** Код вопроса — для лога и разбора «какой именно пропал». */
    code: string;
    reason: HiddenChecklistReason;
    channel: QuestionnaireChannel;
}

/**
 * Перебор вопросов анкеты тем же перечислителем и в том же порядке, что и
 * показ (`checklistFieldRefs`): расхождение означало бы, что считаем мы одно,
 * а прячется другое.
 */
export const collectHiddenChecklistQuestions = (
    def: ChecklistDef,
    portal: Portal | null | undefined,
    rows: ChecklistEntityRows,
): HiddenChecklistQuestion[] => {
    const hidden: HiddenChecklistQuestion[] = [];

    for (const ref of checklistFieldRefs(def)) {
        const { hiddenReason } = resolveChecklistFieldDetailed(
            ref,
            portal,
            rows,
        );
        if (!hiddenReason) continue;
        hidden.push({
            answerKey: ref.answerKey,
            code: ref.def.code,
            reason: hiddenReason,
            channel: ref.def.channel,
        });
    }

    return hidden;
};
