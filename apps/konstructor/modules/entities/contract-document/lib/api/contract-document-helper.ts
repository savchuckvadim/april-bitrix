import { getKonstructor, getKonstructorContract } from '@workspace/nest-konstructor-api';
import type {
    ContractGenerateRequest,
    ContractGenerateResponse,
    ContractSpecificationFormRequest,
    ContractSpecificationFormResponse,
} from '../../model/dto';

/** Единственное место со сгенерированным клиентом договора. */
export class ContractDocumentHelper {
    private konstructor = getKonstructor();
    private contract = getKonstructorContract();

    /** Общая форма и спецификация по сборке (замена konstruct/contract/init) */
    async specificationForm(request: ContractSpecificationFormRequest): Promise<ContractSpecificationFormResponse> {
        return this.contract.contractSpecificationFormSpecificationForm(request);
    }

    /** DOCX договора: ссылка + комментарий в таймлайн сделки */
    async generate(request: ContractGenerateRequest): Promise<ContractGenerateResponse> {
        return this.konstructor.contractGenerateGenerateContract(request);
    }
}
