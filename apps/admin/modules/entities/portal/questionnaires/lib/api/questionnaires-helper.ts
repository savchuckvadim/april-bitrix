import { getAdminPortalQuestionnaires } from '@workspace/nest-admin-api';
import type {
    PortalQuestionnaire,
    PortalQuestionnaireListItem,
    PortalQuestionnaireSave,
    PortalQuestionnaireSchema,
    QuestionnaireAppCode,
} from '../../model';

/**
 * Единственное место импорта транспорта `@workspace/nest-admin-api` для CRUD
 * анкет портала (`admin/portal/:portalId/questionnaires`).
 *
 * Особенности бэка, на которые опираются хуки: создание отвечает HTTP 200
 * (не 201) и делает upsert по паре (приложение, код); удаление тела не
 * возвращает.
 */
export class QuestionnairesHelper {
    private api: ReturnType<typeof getAdminPortalQuestionnaires>;

    constructor() {
        this.api = getAdminPortalQuestionnaires();
    }

    /**
     * Реестр допустимых значений: назначения, контролы, каналы, виды
     * условий со справочниками и матрица «тип поля → контролы». Одинаков
     * для всех порталов — `portalId` бэк не использует, но путь его требует.
     */
    getSchema(portalId: number): Promise<PortalQuestionnaireSchema> {
        return this.api.portalQuestionnairesGetSchema(portalId);
    }

    /**
     * Список анкет портала; без `appCode` — анкеты всех приложений.
     *
     * Фильтр бэк типизирует обычной строкой, а тело сохранения — union-ом
     * кодов приложений. Здесь берётся union: опечатка в фильтре молча
     * вернула бы пустой список вместо ошибки.
     */
    list(
        portalId: number,
        appCode?: QuestionnaireAppCode,
    ): Promise<PortalQuestionnaireListItem[]> {
        return this.api.portalQuestionnairesList(
            portalId,
            appCode ? { appCode } : undefined,
        );
    }

    /** Анкета целиком вместе с составом. */
    getOne(portalId: number, id: string): Promise<PortalQuestionnaire> {
        return this.api.portalQuestionnairesGetOne(portalId, id);
    }

    /** Создать анкету (upsert по паре «приложение + код анкеты»). */
    create(
        portalId: number,
        dto: PortalQuestionnaireSave,
    ): Promise<PortalQuestionnaire> {
        return this.api.portalQuestionnairesCreate(portalId, dto);
    }

    /** Обновить анкету: состав задаётся целиком, лишние вопросы гасятся. */
    update(
        portalId: number,
        id: string,
        dto: PortalQuestionnaireSave,
    ): Promise<PortalQuestionnaire> {
        return this.api.portalQuestionnairesUpdate(portalId, id, dto);
    }

    /** Удалить анкету вместе с вопросами и вариантами (каскадом). */
    remove(portalId: number, id: string): Promise<void> {
        return this.api.portalQuestionnairesRemove(portalId, id);
    }
}
