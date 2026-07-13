import { getPbxField } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type { Field, FieldCreate, FieldUpdate } from '../../model';

/**
 * Единственное место с импортом сгенерированного `pbx-field` клиента.
 * Глобальный справочник полей конструктора (`fields`) — полный CRUD.
 */
export class FieldHelper {
    private api = getPbxField();

    /** Весь справочник полей. */
    list(): Promise<Field[]> {
        return this.api.pbxFieldList();
    }

    /** Поле по id. */
    getById(id: number): Promise<Field> {
        return this.api.pbxFieldGetById(id);
    }

    /** Создать поле. */
    create(dto: FieldCreate): Promise<Field> {
        return this.api.pbxFieldCreate(dto);
    }

    /** Частично обновить поле по id. */
    update(id: number, dto: FieldUpdate): Promise<Field> {
        return this.api.pbxFieldUpdate(id, dto);
    }

    /** Удалить поле по id. */
    remove(id: number): Promise<void> {
        return this.api.pbxFieldRemove(id);
    }
}
