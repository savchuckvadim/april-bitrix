import { getPbxContract } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { Contract } from '../../model';

/**
 * Единственное место, где импортируется сгенерированный `pbx-contract` клиент.
 * Глобальный справочник видов договоров — read-only (list + по id).
 */
export class ContractHelper {
    private api = getPbxContract();

    /** Весь справочник `contracts`. */
    list(): Promise<Contract[]> {
        return this.api.pbxContractList();
    }

    /** Одна запись справочника по id. */
    getById(id: number): Promise<Contract> {
        return this.api.pbxContractGetById(id);
    }
}
