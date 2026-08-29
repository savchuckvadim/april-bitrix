import type {
    PortalQuestionnaireSchema,
    QuestionnaireConditionKindCode,
    QuestionnairePurpose,
} from '../model';
import { QUESTIONNAIRE_CODE, pickQuestionnaireCode } from '../model';

/**
 * Предустановка редактора: назначение и условие показа, проставленные ещё
 * до того, как владелец начал набирать анкету.
 *
 * Зачем она нужна: в матрице пустая ячейка — это «на этом типе события мы
 * ничего не спрашиваем». Кнопка из такой ячейки обязана открыть редактор
 * УЖЕ с её координатами (назначение — колонка, условие — строка), иначе
 * владелец пересобирает руками ровно то, по чему только что кликнул, и
 * запросто промахивается мимо клетки.
 *
 * Предустановка едет в адресе, а не в состоянии: ссылку из ячейки можно
 * открыть в новой вкладке, скинуть коллеге и вернуться по «назад» — а
 * состояние страницы этого не переживает.
 *
 * Коды здесь НЕ хардкодятся: и назначение, и вид условия сверяются с
 * перечислениями контракта (`QUESTIONNAIRE_CODE`), а значение условия — со
 * справочником `GET /schema`. Всё, что реестру и контракту незнакомо,
 * отбрасывается: предустановка обязана быть исполнимой, иначе владелец
 * получил бы 400 на кнопке «Сохранить» за выбор, которого не делал.
 */

/** Что редактор проставит в пустой черновик. */
export interface QuestionnairePreset {
    /** Назначение анкеты — колонка матрицы. */
    purpose: QuestionnairePurpose;
    /** Вид условия показа — группа строк; `null` — условие не предустановлено. */
    conditionKind: QuestionnaireConditionKindCode | null;
    /** Значение условия — строка матрицы; `null` — вид известен, значение нет. */
    conditionValue: string | null;
}

/** Имена параметров адреса: их читает редактор, их же пишет матрица. */
export const QUESTIONNAIRE_PRESET_PARAM = {
    purpose: 'purpose',
    conditionKind: 'conditionKind',
    conditionValue: 'conditionValue',
} as const;

/**
 * Предустановка → строка запроса (без `?`).
 *
 * Пустые куски не пишутся вовсе: параметр со значением `null` в адресе
 * выглядел бы как осознанный выбор «условие без значения».
 */
export const questionnairePresetSearch = (
    preset: QuestionnairePreset,
): string => {
    const search = new URLSearchParams();
    search.set(QUESTIONNAIRE_PRESET_PARAM.purpose, preset.purpose);

    if (preset.conditionKind) {
        search.set(
            QUESTIONNAIRE_PRESET_PARAM.conditionKind,
            preset.conditionKind,
        );
        if (preset.conditionValue) {
            search.set(
                QUESTIONNAIRE_PRESET_PARAM.conditionValue,
                preset.conditionValue,
            );
        }
    }

    return search.toString();
};

/**
 * Источник параметров адреса.
 *
 * Ровно то общее, что есть у `URLSearchParams` и у `ReadonlyURLSearchParams`
 * из `next/navigation`: разбор не должен зависеть от того, кто его позвал —
 * страница или проверка.
 */
export interface QuestionnairePresetSource {
    get(name: string): string | null;
}

/**
 * Адрес → предустановка; `null` — предустановки в адресе нет.
 *
 * Назначение обязательно: без колонки предустановка бессмысленна — условие
 * «тип отчётного события» у анкеты планирования значит совсем не то, что у
 * анкеты отчёта.
 *
 * Значение условия сверяется с реестром, ПОКА он прочитан. Реестр — не
 * копия контракта: список значений (типы событий, стадии) живёт только на
 * бэке, и до его ответа проверить значение нечем — тогда оно берётся как
 * есть, а редактор пересоберёт черновик, когда реестр приедет.
 */
export const parseQuestionnairePreset = (
    search: QuestionnairePresetSource | null | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnairePreset | null => {
    if (!search) return null;

    const purpose = pickQuestionnaireCode(
        QUESTIONNAIRE_CODE.purpose,
        search.get(QUESTIONNAIRE_PRESET_PARAM.purpose),
    );
    if (!purpose) return null;

    const conditionKind =
        pickQuestionnaireCode(
            QUESTIONNAIRE_CODE.conditionKind,
            search.get(QUESTIONNAIRE_PRESET_PARAM.conditionKind),
        ) ?? null;

    const rawValue = conditionKind
        ? search.get(QUESTIONNAIRE_PRESET_PARAM.conditionValue)
        : null;

    return {
        purpose,
        conditionKind,
        conditionValue: pickPresetValue(rawValue, conditionKind, schema),
    };
};

/** Значение условия, если реестр его знает; `null` — предустановки значения нет. */
const pickPresetValue = (
    rawValue: string | null,
    conditionKind: QuestionnaireConditionKindCode | null,
    schema: PortalQuestionnaireSchema | undefined,
): string | null => {
    if (!rawValue || !conditionKind) return null;
    // Реестр ещё не прочитан — сверять не с чем, значение берём как есть.
    if (!schema) return rawValue;

    const values = schema.conditions.find(
        kind => kind.kind === conditionKind,
    )?.values;

    return values?.some(value => value.code === rawValue) ? rawValue : null;
};
