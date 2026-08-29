import type {
    PortalQuestionnaireFieldSync,
    PortalQuestionnaireFieldSyncResult,
    PortalQuestionnaireItemSync,
    PortalQuestionnaireSchema,
    QuestionnaireCheckDiff,
    QuestionnaireCheckItem,
    QuestionnaireCheckResponse,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { optionName } from './questionnaire-list-view';

/**
 * Разбор расхождений с живым Битриксом — человеку и кнопке.
 *
 * Бэк отдаёт по вопросу `diff`: подпись поля, появившиеся варианты,
 * переименованные и исчезнувшие. Здесь он превращается в список строк
 * «сейчас в анкете → в Битриксе» и в тело `apply-field-sync`, чтобы UI
 * оставался вёрсткой, а тело запроса собиралось ровно из того, что
 * владелец видит.
 *
 * Почему не применяем сами: формулировку вопроса и подписи вариантов
 * владелец правит под себя («Дата решения» в поле — «Когда клиент примет
 * решение?» в анкете), и затирать их живым текстом нельзя. Адрес записи
 * (`bitrixId` варианта и гашение исчезнувшего) сверка правит без спроса —
 * его здесь и нет.
 *
 * Выбор — ПОСТРОЧНЫЙ. Одной кнопкой на вопрос было нельзя: чтобы забрать
 * новый вариант списка, владелец обязан был отдать и формулировку вопроса
 * — она уезжала в то же тело и затиралась подписью поля навсегда.
 * Поэтому каждая строка разбора отмечается сама, и тело собирается ровно
 * из отмеченных.
 *
 * Что здесь вообще оказывается, решает СЛЕПОК живого поля в `meta`
 * вопроса (`lib/field-mirror.ts`): строка подписи приходит только на
 * настоящее переименование в портале, а не на всякое расхождение с
 * авторской формулировкой.
 */

/** Что именно разошлось в одной строке разбора. */
export type QuestionnaireSyncKind =
    | 'title'
    | 'optionRenamed'
    | 'optionNew'
    | 'optionLost';

/** Одно расхождение вопроса. */
export interface QuestionnaireSyncLine {
    kind: QuestionnaireSyncKind;
    /** Ключ строки внутри вопроса. */
    key: string;
    /** Ключ строки в отметках владельца: он сквозной по всему разбору. */
    pickKey: string;
    /** Чего касается расхождение. */
    label: string;
    /** Как сейчас в анкете; `null` — у нас такого нет. */
    our: string | null;
    /** Как сейчас в Битриксе; `null` — там его больше нет. */
    live: string | null;
    /** Строку подтягивает кнопка; `false` — это только отчёт. */
    canApply: boolean;
    /** Владелец отметил её к подтягиванию. */
    isPicked: boolean;
    /** Почему подтягивать нечего. */
    note: string | null;
}

/** Отметки владельца поверх умолчаний: ключ строки → подтягивать ли. */
export type QuestionnaireSyncPicks = Readonly<Record<string, boolean>>;

/** Ключ строки в отметках: строки разных вопросов не должны сталкиваться. */
export const syncPickKey = (itemId: string, lineKey: string): string =>
    `${itemId}:${lineKey}`;

/** Ключи строк внутри вопроса — их же читает сборка тела. */
const LINE_KEY = {
    title: 'title',
    renamed: (optionId: string) => `renamed:${optionId}`,
    added: (bitrixId: number) => `new:${bitrixId}`,
    lost: (optionId: string) => `lost:${optionId}`,
} as const;

/**
 * Что отмечено заранее.
 *
 * Правило одно: заранее отмечено только то, что ничего не затирает, —
 * новый вариант списка. Подпись поля и подпись существующего варианта
 * переписали бы авторский текст, а вернуть его будет нечем, поэтому их
 * владелец отмечает сам, увидев обе формулировки.
 *
 * Сама строка подписи теперь редкая: сверка сравнивает живую подпись со
 * СЛЕПКОМ принятого, а не с формулировкой вопроса, — «Дата решения» в
 * Битриксе против «Когда клиент примет решение?» в анкете строку больше
 * не зажигает. Загорается она только на настоящем переименовании в
 * портале, и решение всё равно за владельцем: формулировку вопроса он
 * писал для менеджера.
 */
const isPickedByDefault = (kind: QuestionnaireSyncKind): boolean =>
    kind === 'optionNew';

/** Расхождения одного вопроса вместе с телом их применения. */
export interface QuestionnaireSyncItem {
    itemId: string;
    itemCode: string;
    /** Формулировка вопроса из анкеты; пусто — только код. */
    itemTitle: string;
    fieldName: string | null;
    /** Привязка сломана: вопрос в каталог фрейма не попадёт. */
    isProblem: boolean;
    /** Название состояния привязки из реестра; пусто — привязка цела. */
    statusLabel: string | null;
    lines: QuestionnaireSyncLine[];
    /** Сколько строк вопроса вообще можно подтянуть. */
    applicableCount: number;
    /** Сколько из них отмечено — столько и уедет кнопкой вопроса. */
    pickedCount: number;
    /** Тело применения по этому вопросу; `null` — не отмечено ничего. */
    payload: PortalQuestionnaireItemSync | null;
}

/** Разбор расхождений целиком. */
export interface QuestionnaireFieldSyncReport {
    /** Вопросы, у которых есть что показать. */
    items: QuestionnaireSyncItem[];
    /** Всего расхождений. */
    changeCount: number;
    /** Сколько из них вообще можно подтянуть. */
    applicableCount: number;
    /** Сколько отмечено владельцем — столько и уедет «Подтянуть отмеченное». */
    pickedCount: number;
    /** Одна фраза о разборе — заголовок панели. */
    headline: string;
    /** Почему разбор неполон; `null` — поля читались целиком. */
    degradedReason: string | null;
    /** Тело «Подтянуть отмеченное»; `null` — не отмечено ничего. */
    payload: PortalQuestionnaireFieldSync | null;
}

/** Подписи строк разбора: свои тексты админки, реестра для них нет. */
const LINE_TEXT = {
    title: 'Поле переименовали в Битриксе',
    optionRenamed: 'Вариант переименован',
    optionNew: 'Новый вариант списка',
    optionLost: 'Варианта больше нет',
    lostNote:
        'Этой же сверкой вариант погашен — менеджеру он больше не ' +
        'покажется. Подтягивать нечего.',
} as const;

/** Честная причина неполного чтения, когда бэк своей не прислал. */
const DEGRADED_REASON =
    'Поля читались без прав администратора CRM: подписи и элементы ' +
    'списков этой сверке не были видны — разбор по ним неполон.';

/**
 * Почему подтянуть сейчас нельзя; `null` — можно.
 *
 * Несохранённый черновик — единственная настоящая причина: применение
 * поднимает версию анкеты, редактор пересобирает состав из ответа, и всё
 * набранное владельцем исчезло бы без следа и без подтверждения. Поэтому
 * сначала сохранить, потом подтягивать.
 */
export const getFieldSyncBlockReason = (options: {
    isDirty: boolean;
    isApplying: boolean;
}): string | null => {
    if (options.isDirty) {
        return (
            'Сначала сохраните анкету: подтягивание перечитает состав из ' +
            'ответа бэка, и несохранённые правки пропали бы.'
        );
    }
    if (options.isApplying) return 'Подтягиваем предыдущий выбор…';
    return null;
};

/** Что делать с анкетой, приехавшей в ответе сверки. */
export interface QuestionnaireAdoptDecision {
    /** Класть ли её в кэш карточки. */
    adopt: boolean;
    /** Почему не кладём; `null` — кладём. */
    reason: string | null;
}

/**
 * Можно ли взять анкету из ответа сверки в кэш карточки.
 *
 * ГЛАВНОЕ ПРАВИЛО РАЗДЕЛА. Сверка пишет отметку проверки каждому
 * проверенному вопросу, а редактор пересобирает черновик, как только эта
 * отметка сдвинулась. Значит любой ответ сверки, положенный в кэш поверх
 * грязного черновика, стирает всё набранное владельцем — молча, без
 * подтверждения и без возможности вернуть.
 *
 * Поэтому на грязном черновике ответ остаётся только отчётом: разбор
 * расхождений показывается, а состав анкеты не трогается. Адресные правки
 * сверки (`bitrixId` варианта, гашение исчезнувшего) уже записаны в базу и
 * приедут следующим чтением — после сохранения.
 */
export const canAdoptCheckedQuestionnaire = (options: {
    isDirty: boolean;
}): QuestionnaireAdoptDecision => {
    if (!options.isDirty) return { adopt: true, reason: null };

    return {
        adopt: false,
        reason:
            'В анкете есть несохранённые правки: состав из ответа сверки ' +
            'заменил бы их без следа.',
    };
};

/** Строки разбора одного вопроса вместе с отметками владельца. */
const buildLines = (
    itemId: string,
    diff: QuestionnaireCheckDiff,
    picks: QuestionnaireSyncPicks,
): QuestionnaireSyncLine[] => {
    const lines: QuestionnaireSyncLine[] = [];

    /** Отметка владельца, а без неё — умолчание вида строки. */
    const line = (
        draft: Omit<QuestionnaireSyncLine, 'pickKey' | 'isPicked'>,
    ): QuestionnaireSyncLine => {
        const pickKey = syncPickKey(itemId, draft.key);
        return {
            ...draft,
            pickKey,
            isPicked:
                draft.canApply &&
                (picks[pickKey] ?? isPickedByDefault(draft.kind)),
        };
    };

    if (diff.title) {
        lines.push(
            line({
                kind: 'title',
                key: LINE_KEY.title,
                label: LINE_TEXT.title,
                our: diff.title.our,
                live: diff.title.live,
                canApply: true,
                note: null,
            }),
        );
    }

    for (const option of diff.renamedOptions) {
        lines.push(
            line({
                kind: 'optionRenamed',
                key: LINE_KEY.renamed(option.optionId),
                label: LINE_TEXT.optionRenamed,
                our: option.our,
                live: option.live,
                canApply: true,
                note: null,
            }),
        );
    }

    for (const option of diff.newOptions) {
        lines.push(
            line({
                kind: 'optionNew',
                key: LINE_KEY.added(option.bitrixId),
                label: LINE_TEXT.optionNew,
                our: null,
                live: option.title,
                canApply: true,
                note: null,
            }),
        );
    }

    // Исчезнувший вариант сверка гасит сама: показываем, но применять
    // нечего — иначе владелец ждал бы от кнопки действия, которого нет.
    for (const option of diff.lostOptions) {
        lines.push(
            line({
                kind: 'optionLost',
                key: LINE_KEY.lost(option.optionId),
                label: LINE_TEXT.optionLost,
                our: option.title,
                live: null,
                canApply: false,
                note: LINE_TEXT.lostNote,
            }),
        );
    }

    return lines;
};

/**
 * Тело применения по вопросу; `null` — не отмечено ничего.
 *
 * Собирается СТРОГО по отметкам: подпись поля уезжает только тогда, когда
 * владелец отметил именно её. Иначе один новый вариант списка утаскивал бы
 * с собой формулировку вопроса, и вернуть её было бы нечем.
 */
const buildItemPayload = (
    item: QuestionnaireCheckItem,
    diff: QuestionnaireCheckDiff,
    lines: QuestionnaireSyncLine[],
): PortalQuestionnaireItemSync | null => {
    const picked = new Set(
        lines.filter(line => line.isPicked).map(line => line.key),
    );

    const title =
        diff.title && picked.has(LINE_KEY.title) ? diff.title.live : null;
    const renameOptions = diff.renamedOptions
        .filter(option => picked.has(LINE_KEY.renamed(option.optionId)))
        .map(option => ({
            optionId: option.optionId,
            title: option.live,
        }));
    const addOptions = diff.newOptions
        .filter(option => picked.has(LINE_KEY.added(option.bitrixId)))
        .map(option => ({
            bitrixId: option.bitrixId,
            title: option.title,
            xmlId: option.xmlId,
        }));

    if (
        title === null &&
        renameOptions.length === 0 &&
        addOptions.length === 0
    ) {
        return null;
    }

    // Пустые списки не отправляем: бэк отличает «нечего применять» от
    // «применить пусто», и лишний ключ только шумел бы в логе.
    return {
        itemId: item.itemId,
        ...(title === null ? {} : { title }),
        ...(renameOptions.length > 0 ? { renameOptions } : {}),
        ...(addOptions.length > 0 ? { addOptions } : {}),
    };
};

/** Одна фраза о разборе. */
const describeHeadline = (
    changeCount: number,
    applicableCount: number,
    degraded: boolean,
): string => {
    if (changeCount === 0) {
        return degraded
            ? 'Расхождений не видно: поля читались урезанным способом'
            : 'Расхождений с Битриксом нет';
    }
    if (applicableCount === 0) {
        return (
            `Расхождений с Битриксом: ${changeCount}. Подтягивать нечего — ` +
            'всё, что можно было исправить, сверка исправила сама'
        );
    }
    return (
        `Расхождений с Битриксом: ${changeCount}, из них подтянуть можно ` +
        `${applicableCount}`
    );
};

/**
 * Разбор расхождений для панели редактора.
 *
 * `null` — показывать нечего: сверку не запускали. Пустой разбор
 * возвращается объектом с `changeCount: 0` (панель по нему не рисуется),
 * потому что причина неполного чтения нужна владельцу и тогда, когда
 * расхождений не нашлось.
 */
export const buildFieldSyncReport = (
    response: QuestionnaireCheckResponse | undefined,
    schema: PortalQuestionnaireSchema | undefined,
    picks: QuestionnaireSyncPicks = {},
): QuestionnaireFieldSyncReport | null => {
    if (!response) return null;

    // Формулировки вопросов бэк в отчёте не повторяет — берём их из
    // анкеты, приехавшей тем же ответом.
    const titles = new Map(
        response.questionnaire.items.map(item => [item.code, item.title]),
    );

    const items: QuestionnaireSyncItem[] = [];
    for (const item of response.items) {
        if (!item.diff) continue;

        const lines = buildLines(item.itemId, item.diff, picks);
        if (lines.length === 0) continue;

        const payload = buildItemPayload(item, item.diff, lines);
        const isProblem = item.status !== QUESTIONNAIRE_CODE.fieldStatus.ok;
        items.push({
            itemId: item.itemId,
            itemCode: item.itemCode,
            itemTitle: titles.get(item.itemCode) ?? item.itemCode,
            fieldName: item.fieldName,
            isProblem,
            statusLabel: isProblem
                ? optionName(schema?.fieldStatuses, item.status)
                : null,
            lines,
            applicableCount: lines.filter(line => line.canApply).length,
            pickedCount: lines.filter(line => line.isPicked).length,
            payload,
        });
    }

    const changeCount = items.reduce(
        (total, item) => total + item.lines.length,
        0,
    );
    const applicableCount = items.reduce(
        (total, item) => total + item.applicableCount,
        0,
    );
    const pickedCount = items.reduce(
        (total, item) => total + item.pickedCount,
        0,
    );
    const payloadItems = items
        .map(item => item.payload)
        .filter((item): item is PortalQuestionnaireItemSync => item !== null);

    return {
        items,
        changeCount,
        applicableCount,
        pickedCount,
        headline: describeHeadline(
            changeCount,
            applicableCount,
            response.degraded,
        ),
        degradedReason: response.degraded
            ? (response.error ?? DEGRADED_REASON)
            : null,
        payload: payloadItems.length > 0 ? { items: payloadItems } : null,
    };
};

/** Сколько расхождений разобрано у одного вопроса. */
export const countDiffLines = (
    diff: QuestionnaireCheckDiff | null | undefined,
): number => {
    if (!diff) return 0;
    return (
        (diff.title ? 1 : 0) +
        diff.renamedOptions.length +
        diff.newOptions.length +
        diff.lostOptions.length
    );
};

/** Что именно подтянулось — текст сообщения после применения. */
export const describeFieldSyncResult = (
    result: PortalQuestionnaireFieldSyncResult,
): string => {
    const parts: string[] = [];
    if (result.appliedTitles > 0) {
        parts.push(`подписей вопросов — ${result.appliedTitles}`);
    }
    if (result.renamedOptions > 0) {
        parts.push(`подписей вариантов — ${result.renamedOptions}`);
    }
    if (result.addedOptions > 0) {
        parts.push(`новых вариантов — ${result.addedOptions}`);
    }
    if (parts.length === 0) return 'Подтягивать было нечего';
    return `Подтянуто из Битрикса: ${parts.join(', ')}`;
};
