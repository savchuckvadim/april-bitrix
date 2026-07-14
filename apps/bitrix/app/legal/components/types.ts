export interface LegalSection {
    /** Заголовок раздела документа */
    title: string;
    /** Абзацы раздела; строки, начинающиеся с "— ", рендерятся как пункты списка */
    paragraphs: string[];
}

export interface LegalDocumentData {
    /** Название документа */
    title: string;
    /** Подзаголовок (полное наименование) */
    subtitle: string;
    /** Дата редакции */
    revision: string;
    /** Вступительные абзацы до разделов */
    intro: string[];
    /** Разделы документа */
    sections: LegalSection[];
}
