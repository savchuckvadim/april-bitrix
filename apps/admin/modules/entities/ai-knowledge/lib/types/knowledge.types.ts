/**
 * Типы базы знаний AI (RAG). Написаны руками по DTO бэкенда
 * (back/libs/ai-rag/src/dto/knowledge-response.dto.ts) — в orval-клиент
 * эти эндпоинты ещё не сгенерированы.
 */

/** Документ базы знаний (метаданные без содержимого). */
export interface KnowledgeDocument {
    /** Имя файла документа внутри kind-папки. */
    fileName: string;
    /** Kind-папка, из которой взят документ. */
    kind: string;
    /** Источник документа: shared (общая база) или домен портала. */
    source: string;
}

/** Документ базы знаний с извлечённым текстом. */
export interface KnowledgeDocumentContent extends KnowledgeDocument {
    /** Извлечённый текст документа (PDF/DOCX/XLSX/TXT/MD → plain text). */
    text: string;
}

/** Результат загрузки документа. */
export interface KnowledgeUploadResponse {
    fileName: string;
    kind: string;
    source: string;
}

/** Результат удаления документа. */
export interface KnowledgeDeleteResponse {
    success: boolean;
    fileName: string;
}

/** Параметры списка документов: пара (domain?, kind). */
export interface KnowledgeListParams {
    kind?: string;
    domain?: string;
}

/** Адрес конкретного документа: (domain?, kind, fileName). */
export interface KnowledgeDocumentTarget {
    kind: string;
    fileName: string;
    /** Домен портала; без него — общая база. */
    domain?: string;
}

/** Значение source у документов общей базы. */
export const KNOWLEDGE_SHARED_SOURCE = 'shared';

/** Kind общих материалов (попадают в выдачу любого kind). */
export const KNOWLEDGE_GENERAL_KIND = 'general';

/** Паттерн kind (как на бэке): латиница-цифры-дефис, с буквы. */
export const KNOWLEDGE_KIND_PATTERN = /^[a-z][a-z0-9-]*$/;

/** Паттерн домена портала (как на бэке). */
export const KNOWLEDGE_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9._-]*$/i;

/** Расширения, которые умеет разбирать бэкенд (FileLoaderService). */
export const KNOWLEDGE_ACCEPTED_EXTENSIONS = '.pdf,.docx,.xlsx,.txt,.md';
