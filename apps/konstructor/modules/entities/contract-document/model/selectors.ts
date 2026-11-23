import type { ContractDocumentState } from './ContractDocumentSlice';
import type { ContractSpecificationItem } from './dto';
import type { ContractUnitState } from './types';

interface WithContractDocument {
    contractDocument: ContractDocumentState;
}

export const selectContractFormStatus = (state: WithContractDocument) => state.contractDocument.formStatus;
export const selectContractForm = (state: WithContractDocument) => state.contractDocument.contractForm;
export const selectContractSpecification = (state: WithContractDocument) => state.contractDocument.specification;
export const selectContractDealFields = (state: WithContractDocument) => state.contractDocument.dealFields;
export const selectContractGenerate = (state: WithContractDocument) => state.contractDocument.generate;

/** Состояние единицы по ключу; единицу ещё не заводили — undefined. */
export const selectContractUnitState = (
    state: WithContractDocument,
    key: string,
): ContractUnitState | undefined => state.contractDocument.units[key];

/** Строки спецификации, которые показываем менеджеру сразу: активные и не скрытые. */
export const visibleSpecification = (items: readonly ContractSpecificationItem[]): ContractSpecificationItem[] =>
    items.filter(item => item.isActive && !item.isHidden);

/**
 * Подробности спецификации (легаси «Развернуть»): активные скрытые строки —
 * инфоблоки, энциклопедии решений, Legal Tech, консалтинг, носители.
 */
export const specificationDetails = (items: readonly ContractSpecificationItem[]): ContractSpecificationItem[] =>
    items.filter(item => item.isActive && item.isHidden);

export const selectVisibleSpecification = (state: WithContractDocument) =>
    visibleSpecification(state.contractDocument.specification);

export const selectSpecificationDetails = (state: WithContractDocument) =>
    specificationDetails(state.contractDocument.specification);
