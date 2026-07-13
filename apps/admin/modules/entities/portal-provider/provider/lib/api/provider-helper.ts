import { getAdminPortalProvider } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    CreateProviderWithRq,
    Provider,
    ProviderEnums,
    Rq,
    UpdateRq,
} from '../../model';

/**
 * Единственное место с импортом сгенерированного `admin-portal-provider` клиента.
 * Поставщик (agent) хранит один набор реквизитов (rq); создание и удаление идут
 * транзакцией на бэке.
 */
export class ProviderHelper {
    private api = getAdminPortalProvider();

    /** Справочники select`ов (типы поставщика/реквизитов). */
    getEnums(): Promise<ProviderEnums> {
        return this.api.providerAdminGetEnums();
    }

    /** Поставщики портала с реквизитами по домену. */
    getByDomain(domain: string): Promise<Provider[]> {
        return this.api.providerAdminGetByDomain(domain);
    }

    /** Реквизиты поставщика по id. */
    getOne(id: number): Promise<Rq> {
        return this.api.providerAdminGetOne(id);
    }

    /** Создать поставщика вместе с реквизитами. */
    create(dto: CreateProviderWithRq): Promise<Provider> {
        return this.api.providerAdminCreate(dto);
    }

    /** Частично обновить реквизиты поставщика по id rq. */
    updateRq(id: number, dto: UpdateRq): Promise<Rq> {
        return this.api.providerAdminUpdateRq(id, dto);
    }

    /** Удалить поставщика вместе с реквизитами. */
    remove(id: number): Promise<void> {
        return this.api.providerAdminRemove(id);
    }

    /**
     * Все поставщики системы (без привязки к порталу).
     * Зарезервировано под будущий админский режим («для всех порталов»).
     */
    getAll(): Promise<Rq[]> {
        return this.api.providerAdminGetAll();
    }
}
