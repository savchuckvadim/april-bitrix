import type { ContractDocumentState } from './ContractDocumentSlice';

interface WithContractDocument {
    contractDocument: ContractDocumentState;
}

export const selectContractFormStatus = (state: WithContractDocument) => state.contractDocument.formStatus;
export const selectContractForm = (state: WithContractDocument) => state.contractDocument.contractForm;
export const selectContractSpecification = (state: WithContractDocument) => state.contractDocument.specification;
export const selectContractDealFields = (state: WithContractDocument) => state.contractDocument.dealFields;
export const selectContractGenerate = (state: WithContractDocument) => state.contractDocument.generate;

/** Строки спецификации, которые показываем менеджеру: активные и не скрытые. */
export const selectVisibleSpecification = (state: WithContractDocument) =>
    state.contractDocument.specification.filter(item => item.isActive && !item.isHidden);
