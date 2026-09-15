import type { ChecklistDef } from '../type/call-checklist.type';
import { checklistFieldRefs } from './checklist-values';

/**
 * Черновик ответов анкет: что именно переживает перезагрузку фрейма и под
 * каким ключом лежит.
 *
 * ЗАЧЕМ. Ответ канала `crm` переживает всё, потому что лежит в карточке
 * клиента. Ответы остальных каналов (`dto` — сумма и дата продажи, `smart` —
 * поля элемента смарта, `text` — блок комментария) живут только в памяти
 * вкладки и уезжают вместе с отчётом. Любой уход со страницы — возврат в
 * карточку CRM после ошибки отправки, ⟳, перезапуск фрейма — стирал их
 * молча: менеджер заполнял дату первой оплаты, видел «сохранено», а при
 * следующем открытии поле было пустым.
 *
 * Механика — ровно та же, что у черновика комментария
 * (`EventReport/lib/event-comment-util`): шифрованный localStorage, ключ по
 * контексту клиента и пользователю, восстановление только в ПУСТОЕ.
 */

/**
 * Ключ черновика: домен + клиент (лид или компания) + пользователь.
 *
 * Задачи в ключе нет намеренно — как и у комментария: init перезапускается
 * после каждой отправки, и к моменту восстановления менеджер уже мог открыть
 * другое дело того же клиента. Дробить ключ по задаче значило бы копить
 * мусор от каждой карточки, а сузить восстановление честнее другим
 * способом — оно пишет только отсутствующие ответы.
 */
export const getChecklistDraftKey = (
    domain: string,
    isLeadContext: boolean,
    leadId: number | string | null | undefined,
    companyId: number | string | null | undefined,
    userId: number | string | null | undefined,
): string => {
    const entityPart = isLeadContext
        ? `lead_${leadId ?? 0}`
        : `co_${companyId ?? 0}`;
    return `${domain}_${entityPart}_${userId ?? 0}_checklist`;
};

/**
 * Что кладём в черновик: ответы ВСЕХ каналов, кроме `crm`.
 *
 * Ответ crm-канала в черновике не нужен и вреден: он уже записан в карточке,
 * и вернуть его из localStorage поверх свежего значения портала значило бы
 * показать менеджеру устаревшую правду.
 *
 * Состав вопросов берётся из каталога стора — того же, по которому движок
 * рисует вопросы: читатель и писатель ключей обязаны меняться вместе.
 */
export const pickChecklistDraftAnswers = (
    defs: ChecklistDef[],
    valueByKey: Record<string, string>,
): Record<string, string> => {
    const draft: Record<string, string> = {};
    for (const def of defs) {
        for (const ref of checklistFieldRefs(def)) {
            if (ref.def.channel === 'crm') continue;
            const value = valueByKey[ref.answerKey];
            if (value) draft[ref.answerKey] = value;
        }
    }
    return draft;
};

/**
 * Разбор прочитанного черновика: чужое и повреждённое отбрасываем молча.
 *
 * Восстановление НЕ сверяется с каталогом: анкеты приезжают с портала
 * асинхронно, и черновик, прочитанный раньше состава, отфильтровался бы в
 * пустоту. Ключ, которому не соответствует ни один вопрос, безвреден —
 * ни один селектор его не читает (и в payload он не попадает: сборка идёт
 * по каталогу, а не по ответам).
 */
export const parseChecklistDraft = (raw: unknown): Record<string, string> => {
    if (typeof raw !== 'object' || raw === null) return {};
    const entries: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof value === 'string' && value) entries[key] = value;
    }
    return entries;
};
