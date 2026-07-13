import {
    getPbxPortalMeasure,
    getPbxPortalMeasureMonitoring,
} from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    PortalMeasure,
    PortalMeasureMonitoring,
    PortalMeasureSync,
    PortalMeasureUpdate,
} from '../../model';

/**
 * Единственное место с импортом сгенерированных клиентов портальных единиц
 * измерения: `pbx-portal-measure` (list + sync) и `pbx-portal-measure-monitoring`.
 * Всё адресуется по `domain` портала.
 */
export class PortalMeasureHelper {
    private api = getPbxPortalMeasure();
    private monitoring = getPbxPortalMeasureMonitoring();

    /** Единицы измерения портала (`portal_measure`). */
    list(domain: string): Promise<PortalMeasure[]> {
        return this.api.pbxPortalMeasureList(domain);
    }

    /**
     * Идемпотентно синхронизировать `portal_measure` портала с глобальным
     * справочником `measures`.
     */
    sync(domain: string): Promise<PortalMeasureSync> {
        return this.api.pbxPortalMeasureSync(domain);
    }

    /** Сводка PortalDB ↔ Bitrix + глобальный справочник. */
    getMonitoring(domain: string): Promise<PortalMeasureMonitoring> {
        return this.monitoring.pbxPortalMeasureMonitoringGetByDomain(domain);
    }

    /** Частично обновить портальную единицу измерения по id. */
    update(id: number, dto: PortalMeasureUpdate): Promise<PortalMeasure> {
        return this.api.pbxPortalMeasureUpdate(id, dto);
    }

    /** Удалить портальную единицу измерения по id. */
    remove(id: number): Promise<void> {
        return this.api.pbxPortalMeasureRemove(id);
    }
}
