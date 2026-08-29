import type {
    PortalQuestionnaire,
    PortalQuestionnaireItem,
    PortalQuestionnaireItemSave,
} from '../model';
import {
    QUESTIONNAIRE_AUTO_FIELD_SOURCES,
    QUESTIONNAIRE_CODE,
    QUESTIONNAIRE_FIELD_BOUND_CHANNELS,
} from '../model';
import type { QuestionnaireDraft } from './questionnaire-draft';

/**
 * Черновик редактора → тело сохранения.
 *
 * Редактор держит в черновике всё, что владелец успел набрать, включая
 * поля, которые для текущего выбора не значат ничего: варианты справочника
 * у типа «Строка», путь в отчёте у канала CRM, срок годности у не-даты.
 * Сохранять их нельзя — бэк отвергает такое тело целиком, — а стирать из
 * черновика жалко: переключил тип туда-обратно и потерял разметку.
 *
 * Поэтому чистка живёт здесь, на границе с сетью: черновик остаётся
 * полным, а на бэк уезжает ровно то, что он принимает. Смысл вопроса при
 * этом не меняется — убирается только то, что бэк и так запрещает.
 */

/** Носитель, из которого поле выбрано; в БД не хранится. */
const AUTO_CHAIN_HEAD =
    QUESTIONNAIRE_AUTO_FIELD_SOURCES[0] ??
    QUESTIONNAIRE_CODE.fieldSource.company;

/** Привязка вопроса к полю — то, что определяет достижимость ответа. */
const bindingOf = (
    item: PortalQuestionnaireItemSave | PortalQuestionnaireItem,
): string =>
    [
        item.channel ?? QUESTIONNAIRE_CODE.channel.crm,
        item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto,
        item.targetEntity ?? '',
        item.fieldName ?? '',
        item.fieldType ?? '',
        item.isNative === true ? 'native' : '',
    ].join('|');

/**
 * Восстановление `fieldSource` у НЕТРОНУТОГО вопроса режима
 * «Автоматически».
 *
 * `fieldSource` бэк требует на сохранении, но не хранит и в ответах чтения
 * не отдаёт. У жёсткого носителя его возвращает `toQuestionnaireDraft` (там
 * он равен `targetEntity`), а в режиме «Автоматически» восстановить
 * исходный код неоткуда — и без него редактор не смог бы пересохранить ни
 * одну существующую анкету.
 *
 * Догадкой это не является ровно при одном условии: привязка вопроса не
 * менялась. Для режима «Автоматически» бэк проверяет единственное — что
 * носитель входит в цепочку компания → сделка → лид; вопрос, который уже
 * лежит в БД с такой привязкой, эту проверку прошёл на своём сохранении,
 * поэтому любой код цепочки даёт тот же вердикт, а в базу не попадает
 * ничего: колонки под `fieldSource` нет.
 *
 * Стоит владельцу тронуть поле, канал, тип поля или режим носителя — и
 * подстановка выключается: носитель приезжает из пикера, а если владелец
 * пикер не открывал, проверка черновика честно потребует выбрать поле
 * заново. Иначе поле контакта или смарта уехало бы в компанию молча.
 */
const restoreFieldSource = (
    item: PortalQuestionnaireItemSave,
    saved: Map<string, PortalQuestionnaireItem>,
): PortalQuestionnaireItemSave => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    const targetMode = item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto;

    const needsSource =
        channel === QUESTIONNAIRE_CODE.channel.crm &&
        item.isNative !== true &&
        targetMode === QUESTIONNAIRE_CODE.targetMode.auto &&
        !item.fieldSource;
    if (!needsSource) return item;

    const before = saved.get(item.code);
    if (!before || bindingOf(before) !== bindingOf(item)) return item;

    return { ...item, fieldSource: AUTO_CHAIN_HEAD };
};

/** Чистка вопроса под выбранные канал и тип отображения. */
const cleanItem = (
    item: PortalQuestionnaireItemSave,
): PortalQuestionnaireItemSave => {
    const channel = item.channel ?? QUESTIONNAIRE_CODE.channel.crm;
    const isCrm = channel === QUESTIONNAIRE_CODE.channel.crm;
    const isSmart = channel === QUESTIONNAIRE_CODE.channel.smart;
    const isDto = channel === QUESTIONNAIRE_CODE.channel.dto;
    // Ответ в элемент смарта адресуется жёстко и самоописывающим носителем:
    // цепочки компания → сделка → лид у него нет, и бэк проставил бы это
    // сам. Проставляем здесь, чтобы проверка черновика видела то же тело.
    const targetMode = isSmart
        ? QUESTIONNAIRE_CODE.targetMode.entity
        : (item.targetMode ?? QUESTIONNAIRE_CODE.targetMode.auto);
    // Привязка к полю есть у двух каналов: «Поле CRM» и «Поле элемента
    // смарта». У остальных её чистим — иначе бэк отклонит тело целиком.
    const isFieldBound = QUESTIONNAIRE_FIELD_BOUND_CHANNELS.includes(channel);
    const isDate =
        item.control === QUESTIONNAIRE_CODE.control.date ||
        item.control === QUESTIONNAIRE_CODE.control.datetime;

    return {
        ...item,
        targetMode,
        // Сущность-носитель значит что-то только при жёстком выборе.
        targetEntity: isSmart
            ? QUESTIONNAIRE_CODE.targetEntity.smart
            : targetMode === QUESTIONNAIRE_CODE.targetMode.entity
              ? (item.targetEntity ?? null)
              : null,
        fieldName: isFieldBound ? (item.fieldName ?? null) : null,
        fieldBitrixId: isFieldBound ? (item.fieldBitrixId ?? null) : null,
        fieldXmlId: isFieldBound ? (item.fieldXmlId ?? null) : null,
        fieldCode: isFieldBound ? (item.fieldCode ?? null) : null,
        fieldType: isFieldBound ? (item.fieldType ?? null) : null,
        fieldSource: isFieldBound ? item.fieldSource : undefined,
        // Постоянный адрес носителя есть только у смарт-канала: у
        // остальных он обнуляется, иначе смена канала оставила бы вопрос с
        // адресом смарта, в который он больше не пишет.
        smartId: isSmart ? (item.smartId ?? null) : null,
        // Штатное поле (OPPORTUNITY) бывает только у сделки: у элемента
        // смарта штатных полей нет.
        isNative: isCrm ? item.isNative : false,
        // Путь в отчёте — только у канала «Поле отчёта».
        dtoPath: isDto ? (item.dtoPath ?? null) : null,
        // Требование нового значения сравнивает с тем, что лежит в CRM.
        requireChange: isCrm ? (item.requireChange ?? false) : false,
        // Срок годности считается по дате ответа.
        staleAfterDays: isDate ? (item.staleAfterDays ?? null) : null,
        // Варианты справочника есть только у типа «Список».
        options:
            item.control === QUESTIONNAIRE_CODE.control.enumeration
                ? (item.options ?? [])
                : [],
    };
};

/**
 * Тело сохранения анкеты.
 *
 * Им же проверяется черновик: список нарушений должен описывать то, что
 * реально уедет на бэк, иначе редактор ругался бы на поля, которые сам же
 * и не отправляет.
 */
export const prepareQuestionnaireSave = (
    draft: QuestionnaireDraft,
    saved: PortalQuestionnaire | null | undefined,
): QuestionnaireDraft => {
    const savedItems = new Map(
        (saved?.items ?? []).map(item => [item.code, item]),
    );

    return {
        ...draft,
        code: draft.code.trim(),
        title: draft.title.trim(),
        // Колонка есть только у анкеты-карточки.
        place:
            (draft.presentation ?? QUESTIONNAIRE_CODE.presentation.inline) ===
            QUESTIONNAIRE_CODE.presentation.inline
                ? (draft.place ?? null)
                : null,
        items: draft.items.map(item =>
            restoreFieldSource(cleanItem(item), savedItems),
        ),
    };
};
