import {
    getEventSalesQuestionnaires,
    QuestionnairesResolveApp,
} from '@workspace/nest-event-sales-api';
import type {
    QuestionnaireCatalogDto,
    QuestionnaireCatalogVersionDto,
} from '../../model';

/** Код приложения в каталоге портала (`?app=`) — из реестра контракта. */
const QUESTIONNAIRE_APP_CODE = QuestionnairesResolveApp['event-sales'];

/**
 * Единственное место слайса, знающее про транспорт: портальный каталог анкет
 * с бэка event-sales.
 *
 * Обе ручки — сгенерированный клиент `getEventSalesQuestionnaires`; URL и
 * параметры у него те же, что были у ручного вызова `customAxios`, поэтому
 * поведение конверта и авторизации не менялось.
 *
 * `customAxios` под клиентом разворачивает конверт `{ resultCode, data }` и
 * бросает при `resultCode !== 0`; HTTP≠2xx бросает сам axios. Оба провала —
 * обычный `throw`, и различать их потребителю незачем: любой ведёт в
 * FALLBACK.
 */
export class QuestionnaireHelper {
    private api: ReturnType<typeof getEventSalesQuestionnaires>;

    constructor() {
        this.api = getEventSalesQuestionnaires();
    }

    /** Каталог анкет портала. Портал без анкет отвечает пустым массивом. */
    getCatalog(domain: string): Promise<QuestionnaireCatalogDto> {
        return this.api.questionnairesResolve({
            domain,
            app: QUESTIONNAIRE_APP_CODE,
        });
    }

    /**
     * Версия и хэш состава без самого состава — для проверки «менялся ли
     * каталог». Сравнивать только по `hash`: `version` — сумма версий анкет
     * и при удалении анкеты уменьшается.
     */
    getVersion(domain: string): Promise<QuestionnaireCatalogVersionDto> {
        return this.api.questionnairesVersion({
            domain,
            app: QUESTIONNAIRE_APP_CODE,
        });
    }
}
