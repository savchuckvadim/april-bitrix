import { getPbxMeasure } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { Measure } from '../../model';

/**
 * Единственное место, где импортируется сгенерированный `pbx-measure` клиент.
 * Глобальный справочник единиц измерения — read-only (list + по id).
 */
export class MeasureHelper {
    private api = getPbxMeasure();

    /** Весь справочник `measures`. */
    list(): Promise<Measure[]> {
        return this.api.pbxMeasureList();
    }

    /** Одна запись справочника по id. */
    getById(id: number): Promise<Measure> {
        return this.api.pbxMeasureGetById(id);
    }
}
