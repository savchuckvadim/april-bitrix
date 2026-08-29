import type {
    PortalQuestionnaireSchema,
    QuestionnaireCheckResponse,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { countDiffLines } from './field-sync-view';
import { optionName } from './questionnaire-list-view';

/**
 * Итог сверки привязок с живым Битриксом — по-человечески.
 *
 * Бэк возвращает по вопросу строку «код, статус, изменился ли, сколько
 * вариантов погашено». Владельцу нужен другой разрез: что пропало, где
 * сменился тип и какие варианты справочника исчезли — то есть что именно
 * чинить в редакторе.
 *
 * Кодов статусов здесь ровно один — `ok` (он же различает «в порядке» и «не
 * в порядке» в карточке вопроса). Остальные статусы не перечисляются:
 * группы собираются по тому, что вернул бэк, а подписи берутся из реестра
 * `GET /schema` — так новый статус появится в админке сам.
 */

/** Результат проверки одного вопроса. */
export interface QuestionnaireCheckRow {
    itemId: string;
    itemCode: string;
    /** Формулировка вопроса из анкеты; пусто — только код. */
    itemTitle: string;
    fieldName: string | null;
    status: string;
    /** Название статуса из реестра. */
    statusLabel: string;
    /** Статус изменился этой проверкой. */
    changed: boolean;
    /** Сколько вариантов справочника погашено. */
    deactivatedOptions: number;
    /** Что именно случилось — текст бэка. */
    comment: string | null;
    /** Привязка сломана: вопрос в каталог фрейма не попадёт. */
    isProblem: boolean;
    /**
     * Сколько расхождений с Битриксом разобрано у вопроса: переименования,
     * появившиеся и исчезнувшие варианты. Сами они не применяются — это
     * то, что владелец подтягивает кнопкой.
     */
    changeCount: number;
}

/** Сколько вопросов пришло в одном состоянии. */
export interface QuestionnaireCheckStatusCount {
    status: string;
    /** Название статуса из реестра; неизвестный код — как есть. */
    label: string;
    count: number;
}

/** Итог проверки целиком. */
export interface QuestionnaireCheckSummary {
    /** Сломанные вопросы первыми: чинить нужно их. */
    rows: QuestionnaireCheckRow[];
    /** Сколько вопросов вообще проверялось. */
    checkedCount: number;
    /** Состояния, отличные от «поле на месте». */
    problems: QuestionnaireCheckStatusCount[];
    /** Сколько вопросов со сломанной привязкой всего. */
    problemCount: number;
    /** Сколько вопросов сменили статус этой проверкой. */
    changedCount: number;
    /** Сколько расхождений с Битриксом нашлось всего. */
    changeCount: number;
    /** Сколько вариантов справочника погашено всего. */
    deactivatedOptions: number;
    /** Поля читались урезанным способом — статусы не менялись. */
    degraded: boolean;
    /** Одна фраза о результате — заголовок плашки. */
    headline: string;
    /** Человеческий текст бэка, если он есть. */
    description: string | null;
    /** Есть ли что чинить в редакторе. */
    hasProblems: boolean;
}

/** Сломанный вопрос — вперёд, дальше изменившиеся, дальше остальные. */
const weight = (row: QuestionnaireCheckRow): number => {
    if (row.isProblem) return 0;
    if (row.changed || row.deactivatedOptions > 0) return 1;
    return 2;
};

/** Одна фраза о результате проверки. */
const describeHeadline = (
    checkedCount: number,
    problems: QuestionnaireCheckStatusCount[],
    deactivatedOptions: number,
    changeCount: number,
    degraded: boolean,
): string => {
    if (degraded) {
        return (
            'Поля читались без прав администратора CRM — статусы вопросов ' +
            'не менялись, обновлена только отметка проверки'
        );
    }
    if (checkedCount === 0) {
        return (
            'Проверять нечего: ни один вопрос анкеты не пишет ответ в ' +
            'пользовательское поле — ни в CRM, ни в элементе смарта'
        );
    }

    const parts = problems.map(entry => `${entry.label} — ${entry.count}`);
    if (deactivatedOptions > 0) {
        parts.push(`погашено вариантов — ${deactivatedOptions}`);
    }
    // Расхождения — не поломка: их владелец подтягивает сам. Но узнать о
    // них он должен там же, где о проблемах, иначе кнопка сверки молчала
    // бы ровно о том, ради чего её теперь и жмут.
    if (changeCount > 0) {
        parts.push(`расхождений с Битриксом — ${changeCount}`);
    }
    if (parts.length === 0) return 'Все привязки на месте';

    return `Проверено вопросов: ${checkedCount}. ${parts.join(', ')}`;
};

/** Итог проверки в виде, пригодном для экрана. */
export const buildCheckSummary = (
    response: QuestionnaireCheckResponse | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireCheckSummary | null => {
    if (!response) return null;

    // Заголовки вопросов бэк в отчёте не повторяет — берём их из анкеты,
    // которая приехала в том же ответе уже после применения проверки.
    const titles = new Map(
        response.questionnaire.items.map(item => [item.code, item.title]),
    );

    const rows: QuestionnaireCheckRow[] = response.items
        .map(item => ({
            itemId: item.itemId,
            itemCode: item.itemCode,
            itemTitle: titles.get(item.itemCode) ?? item.itemCode,
            fieldName: item.fieldName,
            status: item.status,
            statusLabel: optionName(schema?.fieldStatuses, item.status),
            changed: item.changed,
            deactivatedOptions: item.deactivatedOptions,
            comment: item.comment ?? null,
            isProblem: item.status !== QUESTIONNAIRE_CODE.fieldStatus.ok,
            changeCount: countDiffLines(item.diff),
        }))
        .sort((left, right) => weight(left) - weight(right));

    const problems: QuestionnaireCheckStatusCount[] = [];
    for (const row of rows) {
        if (!row.isProblem) continue;
        const group = problems.find(entry => entry.status === row.status);
        if (group) {
            group.count += 1;
            continue;
        }
        problems.push({ status: row.status, label: row.statusLabel, count: 1 });
    }

    const deactivatedOptions = rows.reduce(
        (total, row) => total + row.deactivatedOptions,
        0,
    );
    const changedCount = rows.filter(row => row.changed).length;
    const changeCount = rows.reduce((total, row) => total + row.changeCount, 0);
    const problemCount = rows.filter(row => row.isProblem).length;

    return {
        rows,
        checkedCount: rows.length,
        problems,
        problemCount,
        changedCount,
        changeCount,
        deactivatedOptions,
        degraded: response.degraded,
        headline: describeHeadline(
            rows.length,
            problems,
            deactivatedOptions,
            changeCount,
            response.degraded,
        ),
        description: response.error ?? null,
        hasProblems: problems.length > 0,
    };
};
