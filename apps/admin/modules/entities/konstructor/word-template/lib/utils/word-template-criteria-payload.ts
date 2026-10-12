/**
 * Нормализация критериев подбора шаблона Word КП для multipart-запроса.
 *
 * ПОЧЕМУ ОТДЕЛЬНО ОТ ГЕНЕРАЦИИ. Сгенерированный
 * `wordTemplateCreateWordTemplate` собирает FormData сам и кладёт в неё
 * ТОЛЬКО перечисленные в спеке поля — три новых поля бэкенда он молча
 * выбросит. Поэтому они добавляются в FormData явно, этой функцией.
 *
 * Правила — те же, что у шаблонов договора и отчёта о поставке:
 *  - create: пустой список НЕ отправляется (отсутствие поля = «для любого»,
 *    на бэке NULL). `parseMultipartList` на пустой строке даёт `undefined`,
 *    но `"[]"` даёт пустой массив — а это не то же самое, что NULL;
 *  - update: пустой список ОТПРАВЛЯЕТСЯ как `"[]"` — иначе снять
 *    ограничение через интерфейс невозможно (отсутствие поля = «не менять»);
 *  - списки уходят JSON-строкой: бэкенд разбирает их `@Transform(parseMultipartList)`;
 *  - `agent_id` обрезается; пустая строка в create не отправляется, а в
 *    update отправляется (означает «снять привязку к поставщику»).
 */
import type {
    ClientTypeCode,
    SupplyTypeCode,
} from '@/modules/entities/konstructor/lib';
import type { IWordTemplateCriteria } from '../../model';

/** Поля критериев в том виде, в котором они кладутся в FormData. */
export interface WordTemplateCriteriaFormFields {
    agent_id?: string;
    client_types?: string;
    supply_types?: string;
}

/** Список без повторов и пустых значений; пустой результат → `undefined`. */
export function normalizeCriteriaList<T extends string>(
    values: readonly T[] | null | undefined,
): T[] | undefined {
    if (!values || values.length === 0) {
        return undefined;
    }
    const unique = Array.from(new Set(values.filter((value) => value !== '')));
    return unique.length === 0 ? undefined : (unique as T[]);
}

/**
 * Критерии → поля multipart.
 *
 * @param criteria значения из формы
 * @param mode `create` опускает пустые значения, `update` отправляет их
 *             как сброс в «для любого»
 */
export function buildWordTemplateCriteriaFields(
    criteria: IWordTemplateCriteria,
    mode: 'create' | 'update',
): WordTemplateCriteriaFormFields {
    const fields: WordTemplateCriteriaFormFields = {};
    const isUpdate = mode === 'update';

    const agentId = (criteria.agent_id ?? '').trim();
    if (agentId !== '') {
        fields.agent_id = agentId;
    } else if (isUpdate && criteria.agent_id !== undefined) {
        // Пустая строка в update — осмысленное «снять поставщика».
        fields.agent_id = '';
    }

    const clientTypes = normalizeCriteriaList<ClientTypeCode>(
        criteria.client_types,
    );
    if (clientTypes) {
        fields.client_types = JSON.stringify(clientTypes);
    } else if (isUpdate && criteria.client_types !== undefined) {
        fields.client_types = '[]';
    }

    const supplyTypes = normalizeCriteriaList<SupplyTypeCode>(
        criteria.supply_types,
    );
    if (supplyTypes) {
        fields.supply_types = JSON.stringify(supplyTypes);
    } else if (isUpdate && criteria.supply_types !== undefined) {
        fields.supply_types = '[]';
    }

    return fields;
}

/** Дописать поля критериев в уже собранную FormData. */
export function appendWordTemplateCriteria(
    form: FormData,
    criteria: IWordTemplateCriteria,
    mode: 'create' | 'update',
): FormData {
    const fields = buildWordTemplateCriteriaFields(criteria, mode);
    for (const [key, value] of Object.entries(fields)) {
        form.append(key, value);
    }
    return form;
}
