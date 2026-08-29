import type { RootState } from '@/modules/app/model/store';
// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import type { QuestionnaireDtoPath } from '@/modules/entities/Questionnaire/model/questionnaire.type';
import { selectQuestionnaireDefs } from '@/modules/entities/Questionnaire/model/selectors';
import { checklistFieldRefs } from './checklist-values';

/**
 * Ответы dto-канала, разложенные по путям payload'а отправки.
 *
 * Зачем отдельный слой: сборка payload читала значения СТРОКОВЫМИ ЛИТЕРАЛАМИ
 * кода поля (`valueByCode['OPPORTUNITY']`). С портальным каталогом это
 * ломается дважды — переименовали вопрос, и сумма сделки молча уехала
 * пустой; завели чужой вопрос с кодом `OPPORTUNITY`, и он так же молча
 * перезаписал сумму. Адрес ответа теперь объявляет сам каталог (`dtoPath`
 * из закрытого реестра, общего с бэком), а сборка payload только
 * раскладывает готовые значения.
 *
 * Каталог обходится ЦЕЛИКОМ, а не по активным наборам: ответ существует
 * только если менеджер его дал, а активность набора к моменту отправки
 * уже могла смениться (предикт стадии пересчитывается) — гейт остаётся
 * там же, где был, в самой сборке payload (статус работы «Продажа»).
 *
 * Источник состава — ТОТ ЖЕ каталог из стора, по которому движок рисует
 * вопросы и пишет ответы (`selectQuestionnaireDefs`): читатель и писатель
 * ключей обязаны меняться вместе, иначе между ними появится окно, в котором
 * сумма продажи теряется молча.
 */
export type ChecklistDtoAnswers = Partial<Record<QuestionnaireDtoPath, string>>;

export const selectChecklistDtoAnswers = (
    state: RootState,
): ChecklistDtoAnswers => {
    const answers: ChecklistDtoAnswers = {};
    for (const def of selectQuestionnaireDefs(state)) {
        // Ключи ответов собирает общий перечислитель вопросов: писатель
        // (движок) и читатель (payload) обязаны строить их одинаково —
        // расхождение теряло бы ответы молча.
        for (const ref of checklistFieldRefs(def)) {
            const item = ref.def;
            if (item.channel !== 'dto' || !item.dtoPath) continue;
            // Один путь — один ответ: если один и тот же адрес спрашивают
            // две анкеты, побеждает первая ОТВЕЧЕННАЯ по порядку каталога.
            if (answers[item.dtoPath]) continue;
            const value = state.callChecklist.valueByKey[ref.answerKey];
            if (value) answers[item.dtoPath] = value;
        }
    }
    return answers;
};
