import type {
    PortalQuestionnaire,
    PortalQuestionnaireItemSave,
    PortalQuestionnaireSchema,
} from '../model';
import { QUESTIONNAIRE_AUTO_FIELD_SOURCES, QUESTIONNAIRE_CODE } from '../model';
import { toQuestionnaireDraft } from './questionnaire-draft';
import type { QuestionnaireDraft } from './questionnaire-draft';
import { validateQuestionnaireDraft } from './validate-questionnaire-draft';

/**
 * Тело сохранения для переключателя «Включена» в списке анкет.
 *
 * Отдельной ручки для флага у бэка нет: включение — это обычный `PUT`, а он
 * задаёт СОСТАВ ЦЕЛИКОМ (вопрос, которого нет в теле, гасится). Поэтому
 * переключателю нужна анкета вместе с составом, и он пересылает её как есть,
 * меняя один флаг.
 */

/** Носитель, из которого поле выбрано; в БД не хранится. */
const AUTO_CHAIN_HEAD =
    QUESTIONNAIRE_AUTO_FIELD_SOURCES[0] ??
    QUESTIONNAIRE_CODE.fieldSource.company;

/**
 * Восстановление `fieldSource` для НЕИЗМЕНЁННОГО вопроса режима
 * «Автоматически».
 *
 * `fieldSource` бэк требует на сохранении, но не хранит и в ответах чтения
 * не отдаёт. У жёсткого носителя его возвращает `toQuestionnaireDraft`
 * (там он равен `targetEntity`), а у режима «Автоматически» восстановить
 * исходный код неоткуда.
 *
 * Догадкой это не является ровно в одном случае — когда состав не менялся.
 * Для режима «Автоматически» бэк проверяет единственное: носитель входит в
 * цепочку компания → сделка → лид. Вопрос, который уже лежит в БД с этим
 * режимом, ровно эту проверку и прошёл на своём сохранении, поэтому любой
 * код цепочки даёт тот же вердикт, а в базу не попадает вообще ничего:
 * колонки под `fieldSource` нет.
 *
 * ГДЕ ТАК ДЕЛАТЬ НЕЛЬЗЯ: в редакторе. Там пользователь ПЕРЕВЫБИРАЕТ поле и
 * меняет носителя — подставленный код отключил бы ровно ту проверку
 * достижимости, ради которой поле и заводилось (поле контакта или смарта
 * уехало бы в компанию молча). Редактор берёт носитель из пикера, а эта
 * функция живёт только на пути «поменять флаг, не трогая состав».
 */
const withUnchangedFieldSource = (
    item: PortalQuestionnaireItemSave,
): PortalQuestionnaireItemSave => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    const targetMode = item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto;

    const needsSource =
        channel === QUESTIONNAIRE_CODE.channel.crm &&
        item.isNative !== true &&
        targetMode === QUESTIONNAIRE_CODE.targetMode.auto &&
        !item.fieldSource;

    return needsSource ? { ...item, fieldSource: AUTO_CHAIN_HEAD } : item;
};

/** Анкета из БД → тело `PUT` с одним изменённым флагом «Включена». */
export const buildToggleActivePayload = (
    questionnaire: PortalQuestionnaire,
    isActive: boolean,
): QuestionnaireDraft => {
    const draft = toQuestionnaireDraft(questionnaire);
    return {
        ...draft,
        isActive,
        items: draft.items.map(withUnchangedFieldSource),
    };
};

/**
 * Почему анкету нельзя переключить из списка; `null` — можно.
 *
 * Проверяем ровно то тело, которое уедет на бэк: переключатель обязан либо
 * работать, либо честно сказать почему. Анкета, собранная в обход админки
 * (или пережившая ужесточение правил), пересохранение не пройдёт — лучше
 * показать правило, чем поймать 400 на клике.
 */
export const getToggleActiveBlockReason = (
    questionnaire: PortalQuestionnaire,
    schema: PortalQuestionnaireSchema | undefined,
): string | null => {
    if (!schema) return null;

    const issues = validateQuestionnaireDraft(
        buildToggleActivePayload(questionnaire, questionnaire.isActive),
        schema,
    );
    return issues[0]?.message ?? null;
};
