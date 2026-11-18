/**
 * Сводка бюджетов базы знаний: сколько знаков каждого вида попадает в разбор
 * звонка и что обрезается. Написаны руками по DTO бэкенда
 * (back/libs/call-lib/src/call-report/knowledge-budget/dto/knowledge-budget.dto.ts).
 */

/** Место чтения «проверка по регламенту» — её можно выключить на портале. */
export const KNOWLEDGE_USE_COMPLIANCE = 'compliance';

/** Одно место, где вид материалов попадает в промпт. */
export interface KnowledgeBudgetUse {
    use: string;
    title: string;
    budgetChars: number;
    fitChars: number;
    cutChars: number;
    /** Названия типов звонков; null — для всех типов портала. */
    callTypes: string[] | null;
}

/** Один вид материалов базы знаний портала. */
export interface KnowledgeBudgetKind {
    kind: string;
    title: string;
    documents: number;
    chars: number;
    tokens: number;
    uses: KnowledgeBudgetUse[];
    cutChars: number;
}

export interface KnowledgeBudgetMethodology {
    title: string;
    /** Имя для людей («Методика Полянского»); старый бэк его не присылает. */
    displayTitle?: string;
    version: string;
    declaresKnowledge: boolean;
}

export interface KnowledgeBudgetReport {
    domain: string;
    charsPerToken: number;
    /** null — методика на портале не выбрана. */
    methodology: KnowledgeBudgetMethodology | null;
    /** null — настройки портала не прочитаны. */
    complianceEnabled: boolean | null;
    kinds: KnowledgeBudgetKind[];
}
