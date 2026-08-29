import type {
    PortalQuestionnaireSchema,
    QuestionnaireControl,
    QuestionnaireFieldCreate,
    QuestionnaireFieldCreateResponse,
    QuestionnaireFieldSource,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { getFieldRejectReason } from './build-item-from-field';
import { toLatinSlug } from './questionnaire-code';

/**
 * Форма «завести поле в носителе» — вторая половина пикера.
 *
 * Раньше владелец был обязан выйти из админки, найти карточку смарта,
 * завести поле руками и вернуться. Теперь поле заводится отсюда, но
 * правила остаются бэковскими: он их читает ДО нажатия, а не в тексте
 * отказа.
 *
 * Чего здесь принципиально нет: множественности (ответ анкеты уехал бы в
 * первый элемент и исчез) и типов, которых нет в матрице реестра, — поле
 * такого типа анкета всё равно не заполнит.
 */

/** Строка справочника создаваемого поля. */
export interface QuestionnaireFieldCreateOption {
    /** Ключ строки в форме: код собирается из подписи уже при отправке. */
    key: string;
    title: string;
}

/** Черновик нового поля. */
export interface QuestionnaireFieldCreateDraft {
    title: string;
    /** Постфикс UF-имени: предлагается транслитом подписи, но правится. */
    code: string;
    /** `userTypeId` Битрикса. */
    type: string;
    isRequired: boolean;
    options: QuestionnaireFieldCreateOption[];
}

/**
 * Сколько символов оставляем коду поля.
 *
 * Битрикс ограничивает ВСЁ имя пятьюдесятью символами, а префикс у
 * каждого носителя свой (`UF_CRM_COMPANY_`, `UF_CRM_7_`) и известен
 * только бэку — он же и отвечает отказом с точной цифрой. Здесь стоит
 * запас, которого хватает любому носителю: не дать набрать лишнее лучше,
 * чем встретить владельца отказом на кнопке.
 */
export const FIELD_CODE_MAX_LENGTH = 32;

/**
 * Подписи типов поля.
 *
 * СПИСОК типов сюда не переезжает — он приходит из реестра
 * (`schema.fieldTypeControls`), и тип, которого анкета не заполняет, в
 * него просто не попадает. Здесь только человеческие названия:
 * `userTypeId` бэк наружу подписями не отдаёт, а «string» в селекте
 * владельцу ничего не говорит.
 */
const FIELD_TYPE_TITLES: Record<string, string> = {
    string: 'Строка или текст',
    url: 'Ссылка',
    integer: 'Целое число',
    double: 'Число',
    money: 'Деньги',
    date: 'Дата',
    datetime: 'Дата и время',
    boolean: 'Да / нет',
    enumeration: 'Список значений',
};

/** Тип поля в селекте формы. */
export interface QuestionnaireFieldTypeOption {
    /** `userTypeId` Битрикса — ровно он уезжает в тело создания. */
    type: string;
    title: string;
    /** Типы отображения, которые станут доступны вопросу. */
    controls: QuestionnaireControl[];
}

/**
 * Типы поля, которые админка умеет заводить: строки матрицы реестра, у
 * которых есть хотя бы один исполнимый тип отображения. Свой список
 * означал бы, что владельцу дают завести поле, которое анкета потом не
 * сможет заполнить.
 */
export const buildFieldTypeOptions = (
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireFieldTypeOption[] =>
    (schema?.fieldTypeControls ?? [])
        .filter(row => row.controls.length > 0)
        .map(row => ({
            type: row.fieldType,
            title: FIELD_TYPE_TITLES[row.fieldType] ?? row.fieldType,
            controls: row.controls,
        }));

/**
 * Нужен ли типу справочник значений.
 *
 * Считается по матрице, а не по имени типа: справочник спрашивает тот
 * тип, чей единственный исполнимый контрол — «Список».
 */
export const needsFieldOptions = (
    schema: PortalQuestionnaireSchema | undefined,
    type: string,
): boolean =>
    buildFieldTypeOptions(schema)
        .find(option => option.type === type)
        ?.controls.includes(QUESTIONNAIRE_CODE.control.enumeration) ?? false;

/** Свободный ключ строки справочника. */
export const nextFieldOptionKey = (
    options: QuestionnaireFieldCreateOption[],
): string => {
    let index = options.length + 1;
    while (options.some(option => option.key === `opt_${index}`)) index += 1;
    return `opt_${index}`;
};

/** Добавить пустую строку справочника. */
export const addFieldOption = (
    options: QuestionnaireFieldCreateOption[],
): QuestionnaireFieldCreateOption[] => [
    ...options,
    { key: nextFieldOptionKey(options), title: '' },
];

/** Пустой черновик: тип — первый из реестра, справочник с одной строкой. */
export const createFieldDraft = (
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireFieldCreateDraft => ({
    title: '',
    code: '',
    type: buildFieldTypeOptions(schema)[0]?.type ?? 'string',
    isRequired: false,
    options: [{ key: 'opt_1', title: '' }],
});

/**
 * Подпись → код поля: транслит в верхнем регистре.
 *
 * Тот же транслит, что у кода анкеты (`toLatinSlug`): одно и то же
 * название обязано превращаться в один и тот же код, где бы владелец его
 * ни набрал.
 */
export const toFieldCode = (title: string): string =>
    toLatinSlug(title)
        .toUpperCase()
        .slice(0, FIELD_CODE_MAX_LENGTH)
        .replace(/_+$/g, '');

/** Правка подписи тянет за собой код, пока владелец не тронул его сам. */
export const applyFieldTitle = (
    draft: QuestionnaireFieldCreateDraft,
    title: string,
    isCodeTouched: boolean,
): QuestionnaireFieldCreateDraft => ({
    ...draft,
    title,
    code: isCodeTouched ? draft.code : toFieldCode(title),
});

/**
 * Почему поле в этом носителе завести нельзя; `null` — можно.
 *
 * Три причины, и все три бэк повторит отказом:
 *  - носитель не выбран;
 *  - до элемента носителя ответу не добраться (смарт без потока события,
 *    анкета без условия по типу события) — заводить поле в нём бессмысленно;
 *  - поля читались урезанным способом. Это прямой признак, что у ключа
 *    портала нет прав администратора CRM, а `userfieldconfig` без них не
 *    пишет: фолбэка у записи нет в принципе.
 */
export const describeFieldCreateBlockReason = (
    source: QuestionnaireFieldSource | undefined,
    sourceBlockReason: string | null | undefined,
    isDegraded: boolean,
): string | null => {
    if (!source) return 'Сначала выберите носителя, в котором завести поле';
    if (sourceBlockReason) return sourceBlockReason;
    if (source.warning) return source.warning;
    if (isDegraded) {
        return (
            'Поля читались без прав администратора CRM — завести поле ' +
            'Битрикс не даст: userfieldconfig доступен только ' +
            'администратору. Пересоздайте вебхук от имени администратора ' +
            'портала.'
        );
    }
    return null;
};

/**
 * Что мешает отправить форму; `null` — можно создавать.
 *
 * Порядок правил тот же, что у бэка, и формулировки тоже: владелец не
 * должен видеть в админке одно объяснение, а в отказе другое.
 */
export const describeFieldCreateProblem = (
    draft: QuestionnaireFieldCreateDraft,
    schema: PortalQuestionnaireSchema | undefined,
): string | null => {
    if (!draft.title.trim()) {
        return (
            'Подпись поля обязательна: с пустой подписью его не найти ни в ' +
            'карточке портала, ни в списке выбора'
        );
    }

    const code = draft.code.trim().toUpperCase();
    if (!code) {
        return (
            'Код поля обязателен: из него собирается имя UF, по которому ' +
            'анкета и находит поле'
        );
    }
    if (!/^[A-Z0-9_]+$/.test(code)) {
        return (
            'В коде поля допустимы только латинские буквы, цифры и ' +
            'подчёркивание — другое имя Битрикс не примет'
        );
    }
    if (code.length > FIELD_CODE_MAX_LENGTH) {
        return `Код длиннее ${FIELD_CODE_MAX_LENGTH} символов: имя поля вместе с префиксом носителя не уместится в 50 символов`;
    }

    const types = buildFieldTypeOptions(schema);
    if (types.length === 0) {
        return 'Реестр значений не прочитан — без него тип поля не выбрать';
    }
    if (!types.some(option => option.type === draft.type)) {
        return `Поле типа «${draft.type}» анкета заполнить не умеет`;
    }

    if (!needsFieldOptions(schema, draft.type)) return null;

    const titles = draft.options.map(option => option.title.trim());
    if (titles.every(title => !title)) {
        return (
            'У поля-списка должно быть хотя бы одно значение: выбирать ' +
            'менеджеру будет не из чего'
        );
    }
    if (titles.some(title => !title)) {
        return 'У значения справочника пустая подпись — уберите строку или заполните её';
    }
    // Подпись значения у смарт-канала это адрес записи: бэк ищет элемент
    // списка по ней, если у поля нет символьных кодов. Два одинаковых
    // значения сделали бы такой ответ неоднозначным.
    const seen = new Set<string>();
    for (const title of titles) {
        const key = title.toLowerCase();
        if (seen.has(key)) {
            return `Значение «${title}» повторяется: ответ по нему было бы не отличить от соседнего`;
        }
        seen.add(key);
    }

    return null;
};

/** Черновик формы → тело `POST /questionnaire-fields`. */
export const buildFieldCreatePayload = (
    draft: QuestionnaireFieldCreateDraft,
    source: QuestionnaireFieldSource,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireFieldCreate => {
    const code = draft.code.trim().toUpperCase();
    const withOptions = needsFieldOptions(schema, draft.type);

    return {
        entity: source.entity,
        // У штатной сущности идентификатора смарта нет: не отправляем его
        // вовсе, иначе бэк искал бы чужую строку `smarts`.
        ...(source.smartId ? { smartId: source.smartId } : {}),
        code,
        title: draft.title.trim(),
        type: draft.type,
        isRequired: draft.isRequired,
        ...(withOptions
            ? {
                  items: draft.options
                      .filter(option => option.title.trim())
                      .map(option => {
                          const title = option.title.trim();
                          const itemCode = toFieldCode(title);
                          return {
                              title,
                              // Пустой код бэк пронумерует сам: код из
                              // подписи, состоящей из одних символов без
                              // латинской пары, вышел бы пустым.
                              ...(itemCode ? { code: itemCode } : {}),
                          };
                      }),
              }
            : {}),
    };
};

/**
 * Почему заведённое поле в вопрос не уезжает; `null` — уезжает.
 *
 * Форма заказывает только то, что анкета заполнит: одиночное поле типа из
 * матрицы реестра. Но заказ и ответ — разные вещи. Поле с таким кодом в
 * носителе могло УЖЕ БЫТЬ: дубль бэк не заводит, а возвращает найденное
 * как есть (`created: false`) — с его множественностью, его типом и его
 * справочником. Реже расходится и созданное: тип поля называет Битрикс, а
 * не заказ.
 *
 * Правила те же, что у списка выбора (`getFieldRejectReason`), и второго
 * набора быть не может: поле, которое пикер отметить не даёт, мимо пикера
 * в вопрос тоже не уезжает. Иначе вопрос молча встал бы в состав, а
 * анкета перестала бы сохраняться — отказом про поле, которое владелец в
 * списке даже отметить не мог.
 */
export const describeCreatedFieldReject = (
    result: QuestionnaireFieldCreateResponse,
    schema: PortalQuestionnaireSchema | undefined,
    sourceBlockReason: string | null,
): string | null => {
    const reason = getFieldRejectReason(
        result.field,
        schema,
        sourceBlockReason,
    );
    if (!reason) return null;

    if (result.created) {
        return (
            `Поле ${result.field.fieldName} в Битриксе завелось, но вопрос ` +
            `из него не собрать. ${reason}. Поправьте поле в карточке ` +
            'портала и выберите его в списке.'
        );
    }
    return (
        `Поле ${result.field.fieldName} в носителе уже было, и вопрос из ` +
        `него не собрать. ${reason}. Заведите для анкеты поле с другим кодом.`
    );
};
