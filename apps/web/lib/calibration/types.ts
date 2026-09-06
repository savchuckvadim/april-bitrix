/**
 * Модель контента страницы калибровки.
 *
 * Тексты и справочники живут в `lib/calibration/*`, компоненты в
 * `components/calibration/*` только рендерят эти данные (правило репо:
 * данные отдельно от UI).
 */

/** Фрагмент текста внутри абзаца: обычный, полужирный или курсивный */
export interface CalibrationRichChunk {
    kind: 'text' | 'strong' | 'em';
    /** Видимый текст фрагмента */
    value: string;
}

/** Обычный абзац; в тексте допустимы **жирный** и *курсив* */
export interface CalibrationParagraphBlock {
    kind: 'paragraph';
    text: string;
}

/** Выделенная врезка (в исходнике — цитата) */
export interface CalibrationNoteBlock {
    kind: 'note';
    text: string;
}

/** Подзаголовок внутри раздела */
export interface CalibrationSubheadingBlock {
    kind: 'subheading';
    text: string;
}

/** Маркированный список */
export interface CalibrationListBlock {
    kind: 'list';
    items: string[];
}

/** Таблица: шапка и строки одинаковой длины */
export interface CalibrationTableBlock {
    kind: 'table';
    head: string[];
    rows: string[][];
}

/** Любой блок контента раздела */
export type CalibrationBlock =
    | CalibrationParagraphBlock
    | CalibrationNoteBlock
    | CalibrationSubheadingBlock
    | CalibrationListBlock
    | CalibrationTableBlock;

/** Раздел страницы: якорь, заголовок, краткая суть для оглавления и контент */
export interface CalibrationSection {
    /** Якорь раздела (`#id`) — по нему работает оглавление */
    id: string;
    /** Заголовок раздела */
    title: string;
    /** Суть раздела — подпись в оглавлении */
    summary: string;
    /** Содержимое раздела */
    blocks: CalibrationBlock[];
}

/** Вопрос и ответ блока «Частые вопросы» */
export interface CalibrationFaqItem {
    question: string;
    answer: string;
}

/** Раздел брифа: заголовок и блоки */
export interface CalibrationBriefSection {
    title: string;
    blocks: CalibrationBlock[];
    /**
     * Начинать печать раздела с новой страницы. Ставим только крупным
     * разделам — иначе бриф разъезжается на десяток почти пустых листов.
     */
    pageBreakBefore?: boolean;
}

/** Бриф целиком */
export interface CalibrationBriefDocument {
    title: string;
    /** Блоки до первого раздела */
    intro: CalibrationBlock[];
    sections: CalibrationBriefSection[];
    /** Блоки после последнего раздела (подписи, куда отправить) */
    outro: CalibrationBlock[];
}
