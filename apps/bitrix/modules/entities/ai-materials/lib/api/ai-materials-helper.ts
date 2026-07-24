import {
    getAiSettingsClient,
    AiSettingsUpsertDto,
    AiSettingsDocumentParams,
    AiSettingsRemoveParams,
} from '@workspace/nest-api';

/**
 * Единственная точка доступа слайса ai-materials к API кабинета
 * (bitrix-app-client, тег «AI Settings Client»). Авторизация — общий
 * Bearer клиента (interceptor @workspace/nest-api), доменная изоляция
 * на бэке (чужой домен = 403).
 */
export class AiMaterialsHelper {
    private readonly api = getAiSettingsClient();

    /** Порталы аккаунта — выбор домена. */
    listPortals() {
        return this.api.aiSettingsPortals();
    }

    /** Реестр разделов материалов (kind) с описаниями. */
    listKinds() {
        return this.api.aiSettingsKinds();
    }

    /** Документы раздела: клиентские (editable) + общие (чтение). */
    listDocuments(domain: string, kind: string) {
        return this.api.aiSettingsDocuments({ domain, kind });
    }

    /** Извлечённый текст документа. */
    readDocument(params: AiSettingsDocumentParams) {
        return this.api.aiSettingsDocument(params);
    }

    /** Сохранение/перезапись клиентского текстового документа. */
    upsertDocument(dto: AiSettingsUpsertDto) {
        return this.api.aiSettingsUpsert(dto);
    }

    /** Удаление клиентского документа. */
    removeDocument(params: AiSettingsRemoveParams) {
        return this.api.aiSettingsRemove(params);
    }

    /** Итоговый реестр типов звонков домена. */
    callTypes(domain: string) {
        return this.api.aiSettingsCallTypes({ domain });
    }
}
