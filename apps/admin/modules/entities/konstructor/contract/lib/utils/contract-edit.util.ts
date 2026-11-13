import {
    CONTRACT_EDIT_FIELDS,
    type Contract,
    type ContractDraft,
    type ContractEditField,
    type ContractUpdate,
} from '../../model';

/** Значение поля для формы: null и легаси-строка 'null' — пусто. */
const editable = (value: string | null | undefined): string =>
    value == null || value === 'null' ? '' : value;

/** Черновик формы из записи справочника. */
export const toContractDraft = (contract: Contract): ContractDraft => ({
    name: editable(contract.name),
    title: editable(contract.title),
    productName: editable(contract.productName),
    product: editable(contract.product),
    service: editable(contract.service),
    description: editable(contract.description),
    comment: editable(contract.comment),
    comment1: editable(contract.comment1),
    comment2: editable(contract.comment2),
});

/** Изменённые поля черновика (обрезанные по краям); пусто — сохранять нечего. */
export const toContractUpdate = (
    contract: Contract,
    draft: ContractDraft,
): ContractUpdate => {
    const original = toContractDraft(contract);
    const update: ContractUpdate = {};
    for (const field of CONTRACT_EDIT_FIELDS) {
        const next = draft[field.key].trim();
        if (next !== original[field.key].trim()) {
            update[field.key] = next;
        }
    }
    return update;
};

/** Обязательные поля, оставленные пустыми. */
export const missingRequiredFields = (draft: ContractDraft): ContractEditField[] =>
    CONTRACT_EDIT_FIELDS.filter(field => field.required && !draft[field.key].trim());
