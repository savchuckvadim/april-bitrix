import { getAdminContractsManagement } from '@workspace/nest-admin-api';
import { getPbxContract } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { Contract, ContractUpdate } from '../../model';

/**
 * Единственное место, где импортируются сгенерированные клиенты справочника
 * видов договоров: чтение — `pbx-contract`, правка — `admin/contracts`.
 */
export class ContractHelper {
    private api = getPbxContract();
    private admin = getAdminContractsManagement();

    /** Весь справочник `contracts`. */
    list(): Promise<Contract[]> {
        return this.api.pbxContractList();
    }

    /** Одна запись справочника по id. */
    getById(id: number): Promise<Contract> {
        return this.api.pbxContractGetById(id);
    }

    /** Правка записи: уходят только переданные поля. */
    async update(id: number, dto: ContractUpdate): Promise<void> {
        await this.admin.contractUpdateContract(id, dto);
    }
}
