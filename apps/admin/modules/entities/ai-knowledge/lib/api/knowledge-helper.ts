import { customAxios } from '@workspace/nest-admin-api';
import {
    KnowledgeDeleteResponse,
    KnowledgeDocument,
    KnowledgeDocumentContent,
    KnowledgeDocumentTarget,
    KnowledgeKindInfo,
    KnowledgeListParams,
    KnowledgeTextUpsertPayload,
    KnowledgeUploadResponse,
} from '../types/knowledge.types';

const KNOWLEDGE_URL = '/api/admin/ai-rag/knowledge';

/**
 * Обёртка над админ-API базы знаний AI (RAG). Ходит через customAxios
 * admin-бэкенда (тот же base URL и Bearer-токен, что у остальных разделов).
 */
export class KnowledgeHelper {
    /**
     * Реестр kind-разделов: известные (с названиями/описаниями) +
     * фактические папки общей базы (нестандартные — known=false).
     */
    async listKinds() {
        return customAxios<KnowledgeKindInfo[]>({
            url: `${KNOWLEDGE_URL}/kinds`,
            method: 'GET',
        });
    }

    /**
     * Сохранение/перезапись текстового документа (.md/.txt/.json) без
     * multipart — редактор инструкций. С domain — в клиентскую базу.
     */
    async upsertText(payload: KnowledgeTextUpsertPayload) {
        const { kind, ...body } = payload;
        return customAxios<KnowledgeUploadResponse>({
            url: `${KNOWLEDGE_URL}/${kind}/text`,
            method: 'POST',
            data: body,
        });
    }

    /** Домены порталов, у которых есть собственная база знаний. */
    async listDomains() {
        return customAxios<string[]>({
            url: `${KNOWLEDGE_URL}/domains`,
            method: 'GET',
        });
    }

    /** Документы, которые попадут в RAG для пары (domain?, kind). */
    async listDocuments(params: KnowledgeListParams) {
        return customAxios<KnowledgeDocument[]>({
            url: KNOWLEDGE_URL,
            method: 'GET',
            params,
        });
    }

    /** Извлечённый текст конкретного документа. */
    async readContent(target: KnowledgeDocumentTarget) {
        return customAxios<KnowledgeDocumentContent>({
            url: `${KNOWLEDGE_URL}/content`,
            method: 'GET',
            params: target,
        });
    }

    /** Загрузка документа: с domain — в клиентскую базу, без — в общую. */
    async upload(kind: string, file: File, domain?: string) {
        const formData = new FormData();
        formData.append('file', file);
        if (domain) {
            formData.append('domain', domain);
        }
        return customAxios<KnowledgeUploadResponse>({
            url: `${KNOWLEDGE_URL}/${kind}`,
            method: 'POST',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData,
        });
    }

    /** Удаление документа строго из указанной базы. */
    async delete(target: KnowledgeDocumentTarget) {
        return customAxios<KnowledgeDeleteResponse>({
            url: KNOWLEDGE_URL,
            method: 'DELETE',
            params: target,
        });
    }
}
