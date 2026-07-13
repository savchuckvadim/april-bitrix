import { getPbxCounter } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { Counter, CounterCreate, CounterUpdate } from '../../model';

/**
 * Единственное место с импортом сгенерированного `pbx-counter` клиента.
 * Глобальный справочник счётчиков конструктора (`counters`) — полный CRUD.
 */
export class CounterHelper {
    private api = getPbxCounter();

    /** Весь справочник счётчиков. */
    list(): Promise<Counter[]> {
        return this.api.pbxCounterList();
    }

    /** Счётчик по id. */
    getById(id: number): Promise<Counter> {
        return this.api.pbxCounterGetById(id);
    }

    /** Создать счётчик. */
    create(dto: CounterCreate): Promise<Counter> {
        return this.api.pbxCounterCreate(dto);
    }

    /** Частично обновить счётчик по id. */
    update(id: number, dto: CounterUpdate): Promise<Counter> {
        return this.api.pbxCounterUpdate(id, dto);
    }

    /** Удалить счётчик по id. */
    remove(id: number): Promise<void> {
        return this.api.pbxCounterRemove(id);
    }
}
