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

/** Обычный текстовый фрагмент абзаца */
export interface LegalTextChunk {
    kind: 'text';
    /** Текст фрагмента */
    value: string;
}

/** Фрагмент абзаца, который должен быть отрендерен как кликабельная ссылка */
export interface LegalLinkChunk {
    kind: 'link';
    /** Видимый текст ссылки */
    value: string;
    /** Адрес перехода */
    href: string;
}

/** Фрагмент абзаца: текст либо ссылка */
export type LegalChunk = LegalTextChunk | LegalLinkChunk;
