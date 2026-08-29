import type {
    PortalQuestionnaire,
    PortalQuestionnaireCondition,
    PortalQuestionnaireListItem,
    PortalQuestionnaireSchema,
    QuestionnaireOptionDescriptor,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { getToggleActiveBlockReason } from './toggle-active-payload';

/**
 * Строки таблицы анкет: список бэка + подписи из реестра `GET /schema`.
 *
 * Подписи назначений, колонок и условий здесь НЕ хардкодятся — берутся из
 * реестра по коду. Неизвестный код показывается как есть: реестр бэка
 * может уехать вперёд админки, и «сырой» код честнее пустой ячейки.
 */

/** Чипс одного условия показа. */
export interface QuestionnaireConditionChip {
    /** Вид условия — он же ключ списка (виды в анкете не повторяются). */
    kind: string;
    /** Короткая подпись чипса. */
    label: string;
    /** Полная расшифровка для `title` — значений может быть много. */
    title: string;
}

/**
 * Готовая строка таблицы.
 *
 * Тип-алиас, а не интерфейс, намеренно: `DataTable<T>` требует
 * `T extends Record<string, any>`, а интерфейс неявную индексную подпись не
 * получает и таблице не подходит.
 */
export type QuestionnaireRow = {
    id: string;
    appCode: string;
    code: string;
    title: string;
    /** Название назначения из реестра. */
    purposeLabel: string;
    /** Где анкета показывается: колонка карточки либо модалка. */
    placeLabel: string;
    itemsCount: number;
    issuesCount: number;
    isActive: boolean;
    /** Дата последнего сохранения, уже отформатированная. */
    updatedLabel: string;
    /** Условия показа; пусто, пока состав анкеты не подгружен. */
    conditions: QuestionnaireConditionChip[];
    /** Состав ещё грузится — условия и переключатель ждут его. */
    isDetailLoading: boolean;
    /** Почему переключатель недоступен; `null` — доступен. */
    toggleBlockReason: string | null;
};

/** Название значения по коду; неизвестный код показываем как есть. */
export const optionName = (
    options: QuestionnaireOptionDescriptor[] | undefined,
    code: string | null | undefined,
): string => {
    if (!code) return '';
    return options?.find(option => option.code === code)?.name ?? code;
};

/**
 * Где анкета живёт.
 *
 * `place` заполнен ровно у анкеты-карточки: бэк обнуляет колонку у модалки
 * и не даёт задать её вручную, поэтому пустая колонка однозначно означает
 * «модалкой перед отправкой» — отдельного поля в списке для этого нет.
 */
export const describePlace = (
    place: string | null,
    schema: PortalQuestionnaireSchema | undefined,
): string =>
    place
        ? optionName(schema?.places, place)
        : optionName(
              schema?.presentations,
              QUESTIONNAIRE_CODE.presentation.modal,
          );

/** Условия показа чипсами: вид условия и выбранные значения по-русски. */
export const describeConditions = (
    conditions: PortalQuestionnaireCondition[] | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireConditionChip[] =>
    (conditions ?? []).map(condition => {
        const descriptor = schema?.conditions.find(
            kind => kind.kind === condition.kind,
        );
        const kindName = descriptor?.name ?? condition.kind;
        const values = (condition.values ?? []).map(value =>
            optionName(descriptor?.values, value),
        );

        // «Всегда» значений не принимает — чипс остаётся одним словом.
        if (values.length === 0) {
            return {
                kind: condition.kind,
                label: kindName,
                title: descriptor?.description ?? kindName,
            };
        }

        const listed = values.join(', ');
        return {
            kind: condition.kind,
            label: `${kindName}: ${listed}`,
            title: `${kindName}: ${listed}`,
        };
    });

/** Дата сохранения человеку; без даты — прочерк. */
export const formatUpdatedAt = (value: string | null): string => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString('ru-RU', {
        dateStyle: 'short',
        timeStyle: 'short',
    });
};

/**
 * Строки таблицы. Состав анкет (`details`) приходит отдельными запросами —
 * в списке бэка условий нет, а переключателю «включена» нужен состав
 * целиком: сохранение задаёт его полностью.
 */
export const buildQuestionnaireRows = (
    list: PortalQuestionnaireListItem[] | undefined,
    details: Map<string, PortalQuestionnaire>,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireRow[] =>
    (list ?? []).map(item => {
        const detail = details.get(item.id);
        return {
            id: item.id,
            appCode: item.appCode,
            code: item.code,
            title: item.title,
            purposeLabel: optionName(schema?.purposes, item.purpose),
            placeLabel: describePlace(item.place, schema),
            itemsCount: item.itemsCount,
            issuesCount: item.issuesCount,
            isActive: item.isActive,
            updatedLabel: formatUpdatedAt(item.updatedAt),
            conditions: detail
                ? describeConditions(detail.conditions, schema)
                : [],
            isDetailLoading: !detail,
            toggleBlockReason: detail
                ? getToggleActiveBlockReason(detail, schema)
                : null,
        };
    });
