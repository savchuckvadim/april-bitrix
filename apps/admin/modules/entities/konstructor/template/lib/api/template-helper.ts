import { getPbxTemplateBase } from '@workspace/nest-pbx-install-api';
import '@/modules/entities/pbx/lib/pbx-install-client';
import type {
    Template,
    TemplateCounterUpsert,
    TemplateCreate,
    TemplateUpdate,
} from '../../model';

/**
 * Единственное место с импортом сгенерированного `pbx-template-base` клиента.
 * Шаблоны конструктора портала (`templates`): CRUD + управление связями
 * «шаблон ↔ поле» (`template_field`) и «шаблон ↔ счётчик» (`template_counter`).
 */
export class TemplateHelper {
    private api = getPbxTemplateBase();

    /** Шаблоны портала со связями. */
    listByPortal(portalId: number): Promise<Template[]> {
        return this.api.pbxTemplateBaseListByPortal(portalId);
    }

    /** Шаблон по id со связями. */
    getById(id: number): Promise<Template> {
        return this.api.pbxTemplateBaseGetById(id);
    }

    /** Создать шаблон (тело содержит `portalId`). */
    create(dto: TemplateCreate): Promise<Template> {
        return this.api.pbxTemplateBaseCreate(dto);
    }

    /** Частично обновить шаблон по id. */
    update(id: number, dto: TemplateUpdate): Promise<Template> {
        return this.api.pbxTemplateBaseUpdate(id, dto);
    }

    /** Удалить шаблон по id (каскадно — связи). */
    remove(id: number): Promise<void> {
        return this.api.pbxTemplateBaseRemove(id);
    }

    /** Привязать поле к шаблону. */
    attachField(id: number, fieldId: number): Promise<Template> {
        return this.api.pbxTemplateBaseAttachField(id, fieldId);
    }

    /** Отвязать поле от шаблона. */
    detachField(id: number, fieldId: number): Promise<Template> {
        return this.api.pbxTemplateBaseDetachField(id, fieldId);
    }

    /** Привязать счётчик к шаблону с pivot-данными (идемпотентно). */
    attachCounter(
        id: number,
        counterId: number,
        dto: TemplateCounterUpsert,
    ): Promise<Template> {
        return this.api.pbxTemplateBaseAttachCounter(id, counterId, dto);
    }

    /** Обновить pivot связи шаблон↔счётчик. */
    updateCounter(
        id: number,
        counterId: number,
        dto: TemplateCounterUpsert,
    ): Promise<Template> {
        return this.api.pbxTemplateBaseUpdateCounter(id, counterId, dto);
    }

    /** Отвязать счётчик от шаблона. */
    detachCounter(id: number, counterId: number): Promise<Template> {
        return this.api.pbxTemplateBaseDetachCounter(id, counterId);
    }
}
