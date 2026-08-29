import {
    customAxios,
    getAdminPortalQuestionnaireFields,
    getAdminPortalQuestionnaires,
} from '@workspace/nest-admin-api';
import type {
    PortalQuestionnaireFieldSync,
    PortalQuestionnaireFieldSyncResult,
    QuestionnaireCheckResponse,
    QuestionnaireFieldCreate,
    QuestionnaireFieldCreateResponse,
    QuestionnaireFieldSourcesResponse,
    QuestionnaireFieldsQuery,
    QuestionnaireFieldsResponse,
} from '../../model';

/**
 * Сколько ждём создание поля.
 *
 * Общий таймаут транспорта — 30 секунд, и этой ручке их не хватает: она
 * читает список полей носителя, пишет поле и перечитывает его назад, а
 * Битрикс на тарифе regular отдаёт два запроса в секунду. Оборвать её по
 * таймауту хуже, чем подождать: поле в Битриксе к тому моменту уже
 * создано, и владелец увидел бы ошибку на успешной операции.
 */
const CREATE_FIELD_TIMEOUT_MS = 180_000;

/**
 * Единственное место импорта транспорта `@workspace/nest-admin-api` для
 * источника полей (`admin/portal/:portalId/questionnaire-fields`), сверки
 * привязок (`POST …/questionnaires/:id/check`) и применения её разбора
 * (`POST …/questionnaires/:id/apply-field-sync`).
 *
 * Клиентов здесь ДВА: сверка и применение висят на префиксе анкет, поэтому
 * orval положил их в клиент анкет, а не полей. Раскладка по хелперам
 * доменная, а не по тегам Swagger: сверка привязок — работа пикера полей,
 * и хук у неё общий с ним.
 *
 * Обе группы ручек ходят в Битрикс по домену портала, поэтому отвечают
 * fail-open: при недоступном портале приезжает `degraded: true` и
 * человеческий `error`, а не 500.
 */
export class QuestionnaireFieldsHelper {
    private fieldsApi: ReturnType<typeof getAdminPortalQuestionnaireFields>;
    private questionnairesApi: ReturnType<typeof getAdminPortalQuestionnaires>;

    constructor() {
        this.fieldsApi = getAdminPortalQuestionnaireFields();
        this.questionnairesApi = getAdminPortalQuestionnaires();
    }

    /** Носители, у которых можно выбрать поле, плюс домен портала. */
    getSources(portalId: number): Promise<QuestionnaireFieldSourcesResponse> {
        return this.fieldsApi.questionnaireFieldsListSources(portalId);
    }

    /**
     * UF-поля носителя. `entity` обязателен; `smartId` — только для смарта
     * и означает id строки НАШЕЙ БД из `/sources`; `onlyManual` оставляет
     * поля, заведённые владельцем портала вручную.
     *
     * Пустые параметры собираются, а не передаются как есть: `onlyManual`
     * бэк читает как флаг, и `onlyManual=false` в строке запроса означал бы
     * то же самое, что его отсутствие, — но плодил бы второй ключ кэша.
     */
    getFields(
        portalId: number,
        query: QuestionnaireFieldsQuery,
    ): Promise<QuestionnaireFieldsResponse> {
        return this.fieldsApi.questionnaireFieldsListFields(portalId, {
            entity: query.entity,
            ...(query.smartId ? { smartId: query.smartId } : {}),
            ...(query.onlyManual ? { onlyManual: true } : {}),
        });
    }

    /**
     * Завести поле в носителе и получить его в том виде, в каком его
     * отдаёт список полей: имя и идентификаторы значений списка бэк
     * читает из Битрикса ПОСЛЕ записи, поэтому вопрос собирается из
     * ответа без второго запроса.
     *
     * Единственный вызов слайса, написанный руками, а не сгенерированный:
     * маршрут появился после последнего прогона orval. Транспорт тот же —
     * мутатор пакета (`customAxios`, базовый адрес и разбор конверта
     * бэка), поэтому переезд на сгенерированный клиент будет заменой
     * одной строки. Свой таймаут — потому что ручка долгая.
     *
     * Повтор с тем же кодом безопасен: дубль бэк не заводит, а возвращает
     * уже заведённое поле с `created: false`.
     */
    createField(
        portalId: number,
        dto: QuestionnaireFieldCreate,
    ): Promise<QuestionnaireFieldCreateResponse> {
        return customAxios<QuestionnaireFieldCreateResponse>({
            url: `/api/admin/portal/${portalId}/questionnaire-fields`,
            method: 'POST',
            data: dto,
            timeout: CREATE_FIELD_TIMEOUT_MS,
        });
    }

    /**
     * Сверить привязки анкеты с живым Битриксом. Тела запрос не имеет,
     * отвечает HTTP 200 и возвращает анкету целиком уже после применения —
     * её можно положить в кэш вместо повторного чтения.
     *
     * ВНИМАНИЕ: ручка мутирующая. Сверка правит адрес записи (`bitrixId`
     * варианта, гашение исчезнувшего) и отметку проверки у каждого
     * проверенного вопроса. Подписи она не трогает — они уезжают владельцу
     * разбором расхождений (`items[].diff`) и применяются `applyFieldSync`.
     */
    check(portalId: number, id: string): Promise<QuestionnaireCheckResponse> {
        return this.questionnairesApi.questionnaireCheckCheck(portalId, id);
    }

    /**
     * Подтянуть из Битрикса выбранные расхождения: подпись вопроса,
     * подписи вариантов и новые варианты справочника. В Битрикс ручка не
     * ходит — пишет уже принятыми владельцем значениями, одной
     * транзакцией, и поднимает версию анкеты.
     */
    applyFieldSync(
        portalId: number,
        id: string,
        dto: PortalQuestionnaireFieldSync,
    ): Promise<PortalQuestionnaireFieldSyncResult> {
        return this.questionnairesApi.portalQuestionnairesApplyFieldSync(
            portalId,
            id,
            dto,
        );
    }
}
