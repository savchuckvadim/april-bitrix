import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import type { QuestionnaireDraft } from './questionnaire-draft';
import { optionName } from './questionnaire-list-view';

/**
 * Живой предпросмотр анкеты: одной фразой — где она появится и при каких
 * условиях.
 *
 * Условия хранятся кодами (`reportType`, `hot`), и по такому виду
 * невозможно понять, увидит ли менеджер анкету вообще. Фраза собирается из
 * названий реестра `GET /schema` — админка ни одного кода не хардкодит, а
 * названия там подобраны так, что подставляются в предложение без
 * склонения: «Карточкой в колонке», «Модалкой перед отправкой», «Тип
 * отчётного события».
 */

/** «Карточкой в колонке» → «карточкой в колонке». */
const lowerFirst = (value: string): string =>
    value ? value[0]!.toLocaleLowerCase('ru-RU') + value.slice(1) : value;

/**
 * Короткая подпись колонки: «Колонка «Отчёт»» → «Отчёт».
 *
 * Реестр называет колонки полным именем, а в фразе оно уже стоит после
 * «в колонке» — без сокращения вышло бы «в колонке «Колонка «Отчёт»»».
 * Названия без кавычек берутся целиком, поэтому переименование на бэке
 * фразу не ломает.
 */
const shortLabel = (name: string): string =>
    name.match(/[«"']([^»"']+)[»"']/)?.[1] ?? name;

/** «A», «A и B», «A, B и C» — перечисление по-русски. */
const enumerate = (parts: string[]): string => {
    if (parts.length <= 1) return parts[0] ?? '';
    return `${parts.slice(0, -1).join(', ')} и ${parts[parts.length - 1]}`;
};

/** Одно условие словами плюс признак «значений не требует» («Всегда»). */
interface ConditionPart {
    text: string;
    /** Условие без значений — в предложение вставляется без «когда». */
    standalone: boolean;
}

const describeCondition = (
    condition: PortalQuestionnaireCondition,
    schema: PortalQuestionnaireSchema,
): ConditionPart => {
    const descriptor = schema.conditions.find(
        kind => kind.kind === condition.kind,
    );
    // Реестр бэка может уехать вперёд админки: сырой код честнее пустоты.
    if (!descriptor) {
        return { text: condition.kind, standalone: true };
    }

    const name = lowerFirst(descriptor.name);
    if (descriptor.values.length === 0) {
        return { text: name, standalone: true };
    }

    const values = (condition.values ?? []).map(value =>
        optionName(descriptor.values, value),
    );
    if (values.length === 0) {
        return { text: `${name} — значения не выбраны`, standalone: false };
    }

    return { text: `${name} — ${enumerate(values)}`, standalone: false };
};

/** Где анкета появится: способ показа из реестра плюс колонка. */
const describeWhere = (
    draft: QuestionnaireDraft,
    schema: PortalQuestionnaireSchema,
): string => {
    const presentation =
        draft.presentation ?? QUESTIONNAIRE_CODE.presentation.inline;
    const where = `Показывается ${lowerFirst(
        optionName(schema.presentations, presentation),
    )}`;

    // Колонка есть только у карточки — у модалки её и задать нельзя.
    if (presentation !== QUESTIONNAIRE_CODE.presentation.inline) return where;

    return draft.place
        ? `${where} «${shortLabel(optionName(schema.places, draft.place))}»`
        : `${where} (колонка не выбрана)`;
};

/**
 * Фраза предпросмотра целиком.
 *
 * Пустой список условий — не ошибка ввода, а анкета, которая никогда не
 * появится: бэк такую отвергает, поэтому фраза говорит об этом до
 * сохранения, а не после.
 */
export const describeQuestionnairePreview = (
    draft: QuestionnaireDraft,
    schema: PortalQuestionnaireSchema | undefined,
): string => {
    if (!schema) {
        return 'Реестр значений ещё не загружен — предпросмотр собрать нечем.';
    }

    const where = describeWhere(draft, schema);
    const conditions = draft.conditions ?? [];

    if (conditions.length === 0) {
        return (
            `${where}, но условий показа нет — значит не показывается ` +
            'нигде. Для «показывать всегда» есть отдельное условие.'
        );
    }

    const parts = conditions.map(condition =>
        describeCondition(condition, schema),
    );
    const listed = enumerate(parts.map(part => part.text));

    // «Всегда» не требует «когда»: получилось бы «когда всегда».
    return parts.every(part => part.standalone)
        ? `${where} ${listed}.`
        : `${where}, когда ${listed}.`;
};
