import type { PortalQuestionnaireItemSave, QuestionnaireField } from '../model';
import { QUESTIONNAIRE_CODE } from '../model';

/**
 * Слепки живого поля Битрикса в `meta` вопроса — «правда портала» рядом с
 * нашим текстом.
 *
 * Зачем. Владелец правит поле у себя в Битриксе: переименовывает, добавляет
 * и убирает значения списка. Узнать об этом он должен из админки, не
 * открывая портал, — и отличить «поле переименовали» от «я сам назвал
 * вопрос по-своему». Второе — норма («Дата решения» в поле против «Когда
 * клиент примет решение?» в анкете), и сравнение подписи поля с
 * формулировкой вопроса зажигало строку почти у каждого вопроса.
 *
 * Поэтому в `meta` вопроса лежат ДВА слепка:
 *  - `live` — что в поле прямо сейчас. Пишет сверка (бэк) и пикер с
 *    кнопкой «Синхронизировать» (здесь): оба видели живой Битрикс;
 *  - `accepted` — что владелец уже видел и принял: момент привязки и
 *    последующие подтягивания. Ровно с ним сравнивается живое, и
 *    расхождение означает правку В ПОРТАЛЕ.
 *
 * Форма слепка описана ещё и на бэке
 * (`back/libs/portal-lib/store/questionnaires/questionnaire-field-mirror.ts`):
 * `meta` в контракте — открытый объект, места для его типа в DTO нет. При
 * правке формы правятся оба файла.
 */

/** Ключ слепков в `meta`: остальные ключи (min/max, rows) не наши. */
export const QUESTIONNAIRE_FIELD_MIRROR_KEY = 'bitrixField';

/** Элемент списка живого поля в слепке. */
export interface QuestionnaireFieldMirrorOption {
    /** Идентификатор элемента: им вариант и опознаётся между слепками. */
    bitrixId: number | null;
    xmlId: string | null;
    title: string;
}

/** Состояние поля Битрикса на один момент времени. */
export interface QuestionnaireFieldMirrorState {
    title: string;
    /** `userTypeId`; `null` — не прочитан. */
    type: string | null;
    options: QuestionnaireFieldMirrorOption[];
    /** Когда слепок снят, ISO; `null` — время неизвестно. */
    at: string | null;
}

/** Оба слепка вопроса. */
export interface QuestionnaireFieldMirror {
    /** Правда портала на момент последнего чтения; `null` — не читали. */
    live: QuestionnaireFieldMirrorState | null;
    /** Что владелец принял; `null` — сравнивать не с чем. */
    accepted: QuestionnaireFieldMirrorState | null;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const readText = (value: unknown): string | null =>
    typeof value === 'string' ? value : null;

const readNumber = (value: unknown): number | null =>
    typeof value === 'number' && Number.isFinite(value) ? value : null;

/** Вариант без подписи бессмыслен: сравнивать в нём нечего. */
const readOption = (value: unknown): QuestionnaireFieldMirrorOption | null => {
    if (!isRecord(value)) return null;
    const title = readText(value.title);
    if (title === null) return null;

    return {
        bitrixId: readNumber(value.bitrixId),
        xmlId: readText(value.xmlId),
        title,
    };
};

/**
 * Разбор одного слепка. Всё, что не разобралось, считается отсутствующим:
 * `meta` — открытый JSON, и мусор из неё не должен ронять карточку.
 */
const readState = (value: unknown): QuestionnaireFieldMirrorState | null => {
    if (!isRecord(value)) return null;
    const title = readText(value.title);
    if (title === null) return null;

    const options = Array.isArray(value.options)
        ? value.options
              .map(option => readOption(option))
              .filter(
                  (option): option is QuestionnaireFieldMirrorOption =>
                      option !== null,
              )
        : [];

    return {
        title,
        type: readText(value.type),
        options,
        at: readText(value.at),
    };
};

/** Слепки вопроса; мусор и пустота дают пустые слепки. */
export const readFieldMirror = (meta: unknown): QuestionnaireFieldMirror => {
    const raw = isRecord(meta)
        ? meta[QUESTIONNAIRE_FIELD_MIRROR_KEY]
        : undefined;
    if (!isRecord(raw)) return { live: null, accepted: null };

    return { live: readState(raw.live), accepted: readState(raw.accepted) };
};

/**
 * `meta` вопроса с новыми слепками. Остальные ключи сохраняются: в `meta`
 * живут расширения вопроса (min/max, rows), и терять их из-за слепка
 * нельзя.
 */
export const writeFieldMirror = (
    meta: unknown,
    mirror: QuestionnaireFieldMirror,
): Record<string, unknown> => ({
    ...(isRecord(meta) ? meta : {}),
    [QUESTIONNAIRE_FIELD_MIRROR_KEY]: {
        live: mirror.live,
        accepted: mirror.accepted,
    },
});

/** Живое поле пикера → слепок его состояния. */
export const toFieldMirrorState = (
    field: QuestionnaireField,
): QuestionnaireFieldMirrorState => ({
    title: field.title,
    type: field.type,
    options: field.items.map(item => ({
        bitrixId: item.id,
        xmlId: item.xmlId,
        title: item.value,
    })),
    at: new Date().toISOString(),
});

/**
 * `meta` вопроса в момент ПРИВЯЗКИ: увиденное состояние поля становится и
 * живым, и принятым сразу.
 *
 * Это и есть точка, ради которой слепок заведён: владелец только что видел
 * поле в пикере и согласился с ним — всё, что разойдётся позже, будет
 * правкой в портале, а не авторской формулировкой.
 */
export const bindFieldMirror = (
    meta: unknown,
    field: QuestionnaireField,
): Record<string, unknown> => {
    const state = toFieldMirrorState(field);
    return writeFieldMirror(meta, { live: state, accepted: state });
};

/** Подписи сравниваем без краевых пробелов: их правка — не переименование. */
const isSameTitle = (left: string, right: string): boolean =>
    left.trim() === right.trim();

/** Опознание варианта между слепком и анкетой: id, затем внешний код. */
const findMirrorOption = (
    options: QuestionnaireFieldMirrorOption[],
    key: {
        bitrixId: number | null | undefined;
        xmlId: string | null | undefined;
    },
): QuestionnaireFieldMirrorOption | null => {
    const byId =
        key.bitrixId === null || key.bitrixId === undefined
            ? undefined
            : options.find(option => option.bitrixId === key.bitrixId);
    if (byId) return byId;

    const byXmlId = !key.xmlId
        ? undefined
        : options.find(option => option.xmlId === key.xmlId);
    return byXmlId ?? null;
};

/** Значение справочника, каким его видно в Битриксе. */
export interface QuestionnaireLiveOption
    extends QuestionnaireFieldMirrorOption {
    /** Наш вариант с этим значением; `null` — в анкете его нет. */
    ourCode: string | null;
    /** Наша подпись; `null` — варианта в анкете нет. */
    our: string | null;
    /**
     * Подпись в анкете своя. Это НОРМА, а не поломка: владелец правит
     * подписи под менеджера («Прямая» → «Прямые продажи»).
     */
    isTitleOurs: boolean;
    /** Значение переименовали в Битриксе с момента, как владелец принял. */
    isRenamed: boolean;
}

/** Наш вариант, которого в живом поле больше нет. */
export interface QuestionnaireLostOption {
    code: string;
    title: string;
}

/** Живое состояние поля рядом с тем, что записано в вопросе. */
export interface QuestionnaireLiveFieldView {
    /** Подпись поля в Битриксе. */
    title: string;
    /** Тип поля в Битриксе; `null` — не прочитан. */
    type: string | null;
    /** Когда состояние прочитано, ISO; `null` — неизвестно. */
    at: string | null;
    /**
     * Формулировка вопроса отличается от подписи поля. Это НОРМА, а не
     * поломка: вопрос менеджеру и подпись поля в карточке — разные тексты.
     */
    isTitleOurs: boolean;
    /** Поле переименовали в Битриксе: живая подпись против принятой. */
    renamedTitle: { accepted: string; live: string } | null;
    /** Тип поля в Битриксе разошёлся с записанным у вопроса. */
    changedType: { our: string; live: string } | null;
    /** Значения Битрикса — все, с отметкой, есть ли они в анкете. */
    options: QuestionnaireLiveOption[];
    /** Есть в Битриксе, нет в анкете. */
    newOptions: QuestionnaireLiveOption[];
    /** Есть в анкете, нет в Битриксе. */
    lostOptions: QuestionnaireLostOption[];
    /** Переименованных в Битриксе значений. */
    renamedCount: number;
    /** Всё живое состояние уже принято владельцем — показывать нечего. */
    isAccepted: boolean;
}

/**
 * Живое состояние поля вопроса; `null` — правды портала у нас нет (поле не
 * привязано, ни разу не читалось или его больше нет в Битриксе).
 *
 * Считается по слепкам, а не по отдельному запросу: живое состояние пишет
 * сверка, которая и так идёт при каждом открытии редактора. Лишний поход в
 * Битрикс за тем же самым только замедлил бы экран.
 */
export const buildLiveFieldView = (
    item: PortalQuestionnaireItemSave,
): QuestionnaireLiveFieldView | null => {
    const mirror = readFieldMirror(item.meta);
    const live = mirror.live;
    if (!live) return null;

    const accepted = mirror.accepted;
    const renamedTitle =
        accepted && !isSameTitle(accepted.title, live.title)
            ? { accepted: accepted.title, live: live.title }
            : null;
    const changedType =
        item.fieldType && live.type && item.fieldType !== live.type
            ? { our: item.fieldType, live: live.type }
            : null;

    // Значения разбираем только у списка: у любого другого типа
    // отображения вариантов в анкете нет, и весь чужой справочник
    // показался бы «отсутствующим в анкете».
    const isList = item.control === QUESTIONNAIRE_CODE.control.enumeration;
    const ours = isList ? (item.options ?? []) : [];

    const options: QuestionnaireLiveOption[] = isList
        ? live.options.map(option => {
              const our = ours.find(
                  row =>
                      (option.bitrixId !== null &&
                          row.bitrixId === option.bitrixId) ||
                      (!!option.xmlId && row.xmlId === option.xmlId),
              );
              const before = findMirrorOption(accepted?.options ?? [], option);
              return {
                  ...option,
                  ourCode: our?.code ?? null,
                  our: our?.title ?? null,
                  isTitleOurs:
                      our !== undefined &&
                      !isSameTitle(our.title, option.title),
                  isRenamed:
                      before !== null &&
                      !isSameTitle(before.title, option.title),
              };
          })
        : [];

    const lostOptions: QuestionnaireLostOption[] = ours
        .filter(
            row =>
                !live.options.some(
                    option =>
                        (row.bitrixId !== null &&
                            row.bitrixId !== undefined &&
                            option.bitrixId === row.bitrixId) ||
                        (!!row.xmlId && option.xmlId === row.xmlId),
                ),
        )
        .map(row => ({ code: row.code, title: row.title }));

    const newOptions = options.filter(option => option.ourCode === null);
    const renamedCount = options.filter(option => option.isRenamed).length;

    return {
        title: live.title,
        type: live.type,
        at: live.at,
        isTitleOurs: !isSameTitle(item.title, live.title),
        renamedTitle,
        changedType,
        options,
        newOptions,
        lostOptions,
        renamedCount,
        isAccepted:
            renamedTitle === null &&
            renamedCount === 0 &&
            newOptions.length === 0 &&
            lostOptions.length === 0,
    };
};

/** Слепок принятого = живому: владелец увидел состояние поля и принял его. */
const acceptLive = (
    mirror: QuestionnaireFieldMirror,
): QuestionnaireFieldMirror => ({
    live: mirror.live,
    accepted: mirror.live,
});

/**
 * «Принять как есть»: живое состояние становится принятым, тексты вопроса
 * не трогаются.
 *
 * Ради этого действия слепок и разделён надвое. Владелец увидел, что поле
 * в Битриксе называется иначе, и осознанно оставил свою формулировку —
 * повторять ему это на каждой сверке значит вернуть тот самый шум,
 * из-за которого настоящие правки в портале не читались.
 */
export const acceptLiveFieldPatch = (
    item: PortalQuestionnaireItemSave,
): Partial<PortalQuestionnaireItemSave> => ({
    meta: writeFieldMirror(item.meta, acceptLive(readFieldMirror(item.meta))),
});

/** Подпись поля из Битрикса становится формулировкой вопроса. */
export const adoptLiveTitlePatch = (
    item: PortalQuestionnaireItemSave,
): Partial<PortalQuestionnaireItemSave> | null => {
    const mirror = readFieldMirror(item.meta);
    if (!mirror.live) return null;

    return {
        title: mirror.live.title,
        // Подпись принята: разойтись она может теперь только новой правкой
        // в портале.
        meta: writeFieldMirror(item.meta, {
            live: mirror.live,
            accepted: {
                ...(mirror.accepted ?? mirror.live),
                title: mirror.live.title,
            },
        }),
    };
};

/**
 * `meta` вопроса, в которой ОДНО значение справочника считается принятым.
 *
 * Принимается ровно оно: владелец мог взять новое значение и осознанно
 * оставить свою подпись у соседнего — «принять» её за него значило бы
 * погасить расхождение, которого он не принимал.
 */
export const acceptLiveOptionMeta = (
    meta: unknown,
    option: QuestionnaireFieldMirrorOption,
): Record<string, unknown> => {
    const mirror = readFieldMirror(meta);
    const base = mirror.accepted ?? mirror.live;
    if (!base) return writeFieldMirror(meta, mirror);

    const known = findMirrorOption(base.options, option);
    const options =
        known === null
            ? [...base.options, option]
            : base.options.map(row =>
                  row === known ? { ...row, ...option } : row,
              );

    return writeFieldMirror(meta, {
        live: mirror.live,
        accepted: { ...base, options },
    });
};

/**
 * Подтянуть подпись значения из Битрикса.
 *
 * Для канала «Поле элемента смарта» это не косметика: бэк потока переводит
 * ответ в элемент списка ПО ПОДПИСИ значения, и разъехавшаяся подпись
 * означает несделанную запись.
 */
export const adoptLiveOptionTitlePatch = (
    item: PortalQuestionnaireItemSave,
    option: QuestionnaireLiveOption,
): Partial<PortalQuestionnaireItemSave> | null => {
    if (!option.ourCode) return null;

    return {
        options: (item.options ?? []).map(row =>
            row.code === option.ourCode ? { ...row, title: option.title } : row,
        ),
        meta: acceptLiveOptionMeta(item.meta, option),
    };
};
