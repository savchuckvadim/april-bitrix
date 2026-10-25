import type { SupplyFormItem, SupplyFormRequest, SupplyFormSelectItem } from '../model/dto';
import { SUPPLY_TRIGGER_CODES } from '../model/types';

/** Область формы — те же перечисления, что в запросе состава формы. */
export interface SupplyFormScope {
    clientType: SupplyFormRequest['clientType'];
    contractType: SupplyFormRequest['contractType'];
    supplyType: SupplyFormRequest['supplyType'];
}

/** generated value — произвольный объект; у select это вариант {id, code, name, title} */
const isSelectItem = (value: unknown): value is SupplyFormSelectItem =>
    typeof value === 'object' && value !== null && 'code' in value && 'name' in value;

/** Значение select-поля — объект варианта; строка/null — не выбрано. */
export const selectValueOf = (item: SupplyFormItem): SupplyFormSelectItem | null =>
    isSelectItem(item.value) ? item.value : null;

/** Вариант select → значение поля (объектом, как ждёт бэк). */
export const selectItemToValue = (option: SupplyFormSelectItem | null): SupplyFormItem['value'] =>
    option ? { ...option } : null;

export const textValueOf = (item: SupplyFormItem): string =>
    typeof item.value === 'string' ? item.value : '';

const isTrigger = (code: string): boolean =>
    (SUPPLY_TRIGGER_CODES as readonly string[]).includes(code);

/**
 * Какие поля формы показывать (легаси getSupplyData + reducDependComponentInputs):
 * активные, применимые к типу клиента; не-select — ещё и к договору/поставке;
 * зависимые поля группы (`component`) видны, пока триггер группы «Да».
 */
export const visibleSupplyItems = (items: SupplyFormItem[], scope: SupplyFormScope): SupplyFormItem[] => {
    const triggerOpen = new Map<string, boolean>();
    for (const item of items) {
        if (isTrigger(item.code) && item.component) {
            triggerOpen.set(item.component, selectValueOf(item)?.code === 'yes');
        }
    }
    return items
        .filter(item => item.isActive)
        .filter(item => !item.includes?.length || item.includes.includes(scope.clientType as never))
        .filter(item => {
            if (item.type === 'select') return true;
            const byContract = !item.contractType || item.contractType.includes(scope.contractType as never);
            const bySupply = !item.supplies || item.supplies.includes(scope.supplyType as never);
            return byContract && bySupply;
        })
        .filter(item => {
            if (!item.component || isTrigger(item.code) || !triggerOpen.has(item.component)) return true;
            return triggerOpen.get(item.component) === true;
        })
        .sort((a, b) => a.order - b.order);
};

/** Подписи обязательных видимых полей без значения. */
export const missingSupplyFields = (visible: SupplyFormItem[], files: Record<string, unknown>): string[] =>
    visible
        .filter(item => item.isRequired)
        .filter(item => {
            if (item.type === 'select') return !selectValueOf(item);
            if (item.type === 'file') return !files[item.code] && !item.value;
            return !textValueOf(item).trim();
        })
        .map(item => item.name);

/** Дефолты формы с бэка приходят готовыми; select без значения — первый вариант «нет». */
export const withSelectDefaults = (items: SupplyFormItem[]): SupplyFormItem[] =>
    items.map(item => {
        if (item.type !== 'select' || selectValueOf(item) || !item.items?.length) return item;
        return { ...item, value: selectItemToValue(item.items[0] ?? null) };
    });
