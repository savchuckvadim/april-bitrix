import { getPbxPortalContract } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    PortalContract,
    PortalContractCreate,
    PortalContractForm,
    PortalContractUpdate,
} from '../../model';

/**
 * Единственное место с импортом сгенерированного `pbx-portal-contract` клиента.
 * Чтение: список + initial-данные формы (select-опции связей). Запись: создание
 * (портал — по `domain`), частичное обновление и удаление по id.
 */
export class PortalContractHelper {
    private api = getPbxPortalContract();

    /** Договоры портала (`portal_contracts`). */
    list(domain: string): Promise<PortalContract[]> {
        return this.api.pbxPortalContractList(domain);
    }

    /** Select-опции связей для формы создания договора портала. */
    getForm(domain: string): Promise<PortalContractForm> {
        return this.api.pbxPortalContractGetForm(domain);
    }

    /** Создать договор портала (по `domain`). */
    create(domain: string, dto: PortalContractCreate): Promise<PortalContract> {
        return this.api.pbxPortalContractCreate(domain, dto);
    }

    /** Частично обновить договор портала по id. */
    update(id: number, dto: PortalContractUpdate): Promise<PortalContract> {
        return this.api.pbxPortalContractUpdate(id, dto);
    }

    /** Удалить договор портала по id. */
    remove(id: number): Promise<void> {
        return this.api.pbxPortalContractRemove(id);
    }
}
