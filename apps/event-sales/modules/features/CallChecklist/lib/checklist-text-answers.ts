import type { RootState } from '@/modules/app/model/store';
import { selectQuestionnaireDefs } from '@/modules/entities/Questionnaire/model/selectors';
import { checklistFieldRefs } from './checklist-values';
import { checklistAnswerLabel } from './checklist-answer-label';

/**
 * Ответы канала `text` — блоком для КОММЕНТАРИЯ события.
 *
 * Третий канал ответа наравне с `crm` (поле сущности) и `dto` (payload
 * отправки): вопрос, у которого поля в CRM нет и заводить его незачем —
 * ответ нужен людям в ленте, а не аналитике. До этого канал был объявлен в
 * контракте, но исполнителя во фрейме не имел: вопрос рисовался, ответ жил в
 * стейте и никуда не уезжал.
 *
 * Каталог обходится ЦЕЛИКОМ, как и у dto-ответов: ответ существует, только
 * если менеджер его дал, а активность анкеты к моменту отправки могла
 * смениться — выбрасывать уже данный ответ из-за этого нельзя.
 *
 * Формат повторяет блоки опросника после презентации («— Заголовок —», ниже
 * строки `· вопрос: ответ`): комментарий читают в таймлайне Битрикса, и два
 * разных оформления в одном тексте выглядели бы сбоем.
 */
export const selectChecklistTextComment = (state: RootState): string => {
    const blocks: string[] = [];

    for (const def of selectQuestionnaireDefs(state)) {
        const lines = checklistFieldRefs(def)
            .filter(ref => ref.def.channel === 'text')
            .map(ref => ({
                def: ref.def,
                value: state.callChecklist.valueByKey[ref.answerKey] ?? '',
            }))
            .filter(answer => answer.value.trim().length > 0)
            .map(
                answer =>
                    `· ${answer.def.title}: ${checklistAnswerLabel(
                        answer.def,
                        answer.value,
                    )}`,
            );

        if (lines.length > 0) {
            blocks.push([`— ${def.title} —`, ...lines].join('\n'));
        }
    }

    return blocks.join('\n\n');
};
