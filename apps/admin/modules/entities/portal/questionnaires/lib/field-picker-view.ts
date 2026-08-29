import type {
    PortalQuestionnaireCondition,
    PortalQuestionnaireSchema,
    QuestionnaireField,
    QuestionnaireFieldSource,
    QuestionnaireFieldUsage,
    QuestionnaireFieldsResponse,
    QuestionnairePortalSmart,
} from '../model';
import { QUESTIONNAIRE_CODE } from '../model';
import { getFieldRejectReason } from './build-item-from-field';
import { describeSmartTarget } from './smart-target-view';
import type { QuestionnaireSmartTarget } from './smart-target-view';

/**
 * Список полей носителя, каким его видит владелец.
 *
 * Поля не прячутся, когда взять их в анкету нельзя: владелец, который сам
 * завёл поле в CRM, должен увидеть его в списке и прочитать причину, а не
 * решить, что админка поле потеряла. Ровно поэтому и множественное поле, и
 * смарт, до которого ответу не добраться, описаны словами, а не молчанием.
 */

/** Строка пикера: поле плюс приговор по нему. */
export interface QuestionnaireFieldRow {
    field: QuestionnaireField;
    /** Почему поле взять нельзя; `null` — годится. */
    rejectReason: string | null;
    /** Поле завёл владелец портала руками, а не установщик. */
    isManual: boolean;
    /** Вопросы анкет портала, уже привязанные к этому полю. */
    usedIn: QuestionnaireFieldUsage[];
    /** В скольких вопросах анкет портала поле уже используется. */
    usedCount: number;
}

/** Фильтры пикера: и то, и другое считается на уже загруженном списке. */
export interface QuestionnaireFieldFilters {
    /** Поиск по названию, UF-имени и коду из слепка. */
    search?: string;
    /** Оставить только поля, заведённые владельцем вручную. */
    onlyManual?: boolean;
}

/** Плашка над списком: своя формулировка админки плюс текст бэка. */
export interface QuestionnaireFieldNotice {
    /** Что происходит — словами админки. */
    title: string;
    /** Человеческий текст бэка: по нему чинят портал. */
    description: string | null;
    /**
     * Плашка про запрет или про то, куда уедет ответ. Разные вещи: первая
     * объясняет, почему выбрать нельзя, вторая — что будет, когда выберут.
     */
    tone: 'warning' | 'info';
}

const matches = (field: QuestionnaireField, search: string): boolean => {
    const needle = search.trim().toLowerCase();
    if (!needle) return true;

    return [field.title, field.fieldName, field.portalCode ?? '']
        .join(' ')
        .toLowerCase()
        .includes(needle);
};

/** Одно поле → строка пикера с приговором и метками. */
const toRow = (
    field: QuestionnaireField,
    schema: PortalQuestionnaireSchema | undefined,
    sourceBlockReason: string | null | undefined,
): QuestionnaireFieldRow => ({
    field,
    rejectReason: getFieldRejectReason(field, schema, sourceBlockReason),
    // `inPortalDb: false` — поле завёл владелец руками. Ради этих полей
    // раздел и делался: их нет ни в одном слепке установщика.
    isManual: !field.inPortalDb,
    usedIn: field.usedIn ?? [],
    usedCount: field.usedIn?.length ?? 0,
});

/**
 * Строки пикера.
 *
 * `onlyManual` бэк умеет и сам, но считать его здесь дешевле: список полей
 * носителя уже загружен, а переключение фильтра не должно ходить в Битрикс
 * заново.
 *
 * `sourceBlockReason` — причина, по которой ответу не добраться до
 * НОСИТЕЛЯ целиком (её считает `describeSmartSource`). Она проставляется
 * каждой строке: поля показаны, но отметить их нельзя, и владелец читает
 * ровно ту фразу, которой отказал бы бэк.
 */
export const buildFieldPickerRows = (
    fields: QuestionnaireField[] | undefined,
    schema: PortalQuestionnaireSchema | undefined,
    sourceBlockReason: string | null | undefined,
    filters: QuestionnaireFieldFilters = {},
): QuestionnaireFieldRow[] =>
    (fields ?? [])
        .filter(field => !filters.onlyManual || !field.inPortalDb)
        .filter(field => matches(field, filters.search ?? ''))
        .map(field => toRow(field, schema, sourceBlockReason));

/** Сколько строк списка вообще можно отметить. */
export const countSelectableRows = (rows: QuestionnaireFieldRow[]): number =>
    rows.filter(row => !row.rejectReason).length;

/** Ключ носителя для селекта: смарты различаются только `smartId`. */
export const fieldSourceKey = (source: QuestionnaireFieldSource): string =>
    `${source.entity}:${source.smartId ?? ''}`;

/**
 * «Уже используется в анкете X» — где именно поле занято.
 *
 * Дублировать поле в двух анкетах бэк не запрещает, и иногда это осознанно
 * (один и тот же вопрос в анкете планирования и в анкете отчёта). Но
 * увидеть это владелец обязан ДО выбора: чаще всего повтор означает, что
 * анкету уже собрали, а сейчас собирают её второй раз.
 */
export const describeFieldUsage = (
    usedIn: QuestionnaireFieldUsage[],
): string | null => {
    if (usedIn.length === 0) return null;

    const places = usedIn.map(
        usage => `«${usage.questionnaireTitle}» → ${usage.itemTitle}`,
    );
    return `Уже используется: ${places.join('; ')}`;
};

/** Носитель в списке выбора — и доступны ли анкете его поля. */
export interface QuestionnaireFieldSourceOption {
    /** Ключ селекта: смарты различаются только `smartId`. */
    key: string;
    title: string;
    /** Почему поля носителя взять нельзя; `null` — можно. */
    blockReason: string | null;
}

/**
 * Список носителей с пометкой доступности.
 *
 * Владелец выбирает тип события в условиях показа — и сразу видит, поля
 * какого смарта ему открылись. Прятать недоступные смарты нельзя: их поля
 * он завёл сам и искал бы пропажу, поэтому носитель остаётся в списке, а
 * причина читается в плашке над полями.
 */
export const buildFieldSourceOptions = (
    sources: QuestionnaireFieldSource[],
    smarts: QuestionnairePortalSmart[] | undefined,
    conditions: PortalQuestionnaireCondition[] | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireFieldSourceOption[] =>
    sources.map(source => ({
        key: fieldSourceKey(source),
        title: source.title,
        blockReason:
            describeSmartSource(source, smarts, conditions, schema)
                ?.blockReason ?? null,
    }));

/**
 * Разбор смарт-носителя пикера; `null` — носитель штатный.
 *
 * Тонкая обёртка над `describeSmartTarget`: тот же разбор нужен проверке
 * черновика, поэтому правило живёт отдельно, а здесь остаётся только
 * «смарт ли это и какая у него строка `smarts`».
 */
export const describeSmartSource = (
    source: QuestionnaireFieldSource | undefined,
    smarts: QuestionnairePortalSmart[] | undefined,
    conditions: PortalQuestionnaireCondition[] | undefined,
    schema: PortalQuestionnaireSchema | undefined,
): QuestionnaireSmartTarget | null => {
    if (!source || source.entity !== QUESTIONNAIRE_CODE.fieldSource.smart) {
        return null;
    }
    return describeSmartTarget(source.smartId, smarts, conditions, schema);
};

/**
 * Плашка над списком полей; `null` — говорить нечего.
 *
 * У смарта плашка обязательна: она называет либо причину, по которой поля
 * взять нельзя, либо элемент, в который уедет ответ. Спрятать смарты из
 * списка было бы враньём — владелец видит их поля в карточке и искал бы
 * пропажу.
 */
export const describeSourceNotice = (
    source: QuestionnaireFieldSource | undefined,
    smartSource: QuestionnaireSmartTarget | null = null,
): QuestionnaireFieldNotice | null => {
    if (!source) return null;

    if (smartSource) {
        const title = smartSource.blockReason ?? smartSource.hint;
        if (title) {
            return {
                title,
                description: source.warning ?? null,
                tone: smartSource.blockReason ? 'warning' : 'info',
            };
        }
    }

    // Носитель может быть сломан сам по себе: смарт без bitrixId из
    // `crm.type.list` адресовать нечем, и поля у него не прочитаются.
    return source.warning
        ? {
              title: 'Носитель прочитан не полностью',
              description: source.warning,
              tone: 'warning',
          }
        : null;
};

/**
 * Плашка неполного чтения полей; `null` — поля прочитаны полностью.
 *
 * `userfieldconfig` доступен только администратору CRM. Без него бэк
 * читает `crm.item.fields`: имена полей там настоящие, а символьных кодов
 * и идентификаторов нет — привязка пойдёт по UF-имени, и переименование
 * поля в Битриксе её не переживёт. Молчать об этом нельзя: вопрос
 * соберётся, а вариантам списка не хватит `bitrixId`, и владелец получит
 * отказ уже на сохранении.
 */
export const describeDegradedNotice = (
    response:
        | Pick<QuestionnaireFieldsResponse, 'degraded' | 'error'>
        | undefined,
): QuestionnaireFieldNotice | null => {
    if (!response?.degraded) return null;

    return {
        title:
            'У ключа портала нет прав администратора CRM — читаем через ' +
            'crm.item.fields: символьные коды недоступны, привязка пойдёт ' +
            'по UF-имени.',
        description: response.error ?? null,
        tone: 'warning',
    };
};
