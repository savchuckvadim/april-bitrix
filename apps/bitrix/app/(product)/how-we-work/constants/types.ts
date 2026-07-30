/** Тип контентного блока страницы раздела «Как мы работаем». */
export type HowContentBlock =
    | { type: 'lead'; text: string }
    | { type: 'heading'; text: string }
    | { type: 'paragraph'; text: string }
    | {
          type: 'cards';
          columns?: 2 | 3;
          items: { title: string; text: string; badge?: string }[];
      }
    | { type: 'steps'; items: { title: string; text: string }[] }
    | { type: 'list'; items: string[] }
    | { type: 'table'; head: string[]; rows: string[][]; caption?: string }
    | { type: 'note'; tone: 'info' | 'good' | 'warn' | 'bad'; text: string }
    | { type: 'story'; tag: string; text: string }
    | { type: 'diagram'; chart: string; caption?: string }
    | { type: 'screen'; label: string }
    | { type: 'questionnaire'; questionnaireId: HowQuestionnaireId };

/** Страница раздела. */
export interface HowPageContent {
    /** Сегмент URL внутри /how-we-work */
    slug: string;
    /** Заголовок страницы (h1) */
    title: string;
    /** Надзаголовок-ярлык над h1 */
    eyebrow: string;
    /** Подводка под заголовком; используется и в metadata.description */
    description: string;
    /** Контентные блоки в порядке рендера */
    blocks: HowContentBlock[];
    /** Финальный CTA страницы */
    cta?: { label: string; href: string; note?: string };
}

/** Идентификаторы анкет внедрения. */
export type HowQuestionnaireId = 'process' | 'inbound' | 'catalogs';

/** Вариант ответа на вопрос анкеты. */
export interface HowQuestionnaireOption {
    value: string;
    /** Рекомендуемый вариант — подсвечивается */
    recommended?: boolean;
}

/** Вопрос анкеты. */
export interface HowQuestionnaireQuestion {
    id: string;
    title: string;
    /** Пояснение под вопросом */
    hint?: string;
    options: HowQuestionnaireOption[];
    /** Разрешить свободный «свой вариант» */
    allowCustom?: boolean;
    /** Плейсхолдер поля комментария */
    commentPlaceholder?: string;
}

/** Анкета целиком. */
export interface HowQuestionnaire {
    id: HowQuestionnaireId;
    title: string;
    description: string;
    questions: HowQuestionnaireQuestion[];
    /** Заголовок скачиваемого протокола */
    protocolTitle: string;
}

/** Ответ на один вопрос (состояние клиента). */
export interface HowAnswer {
    choice?: string;
    custom?: string;
    comment?: string;
}

/** Приложение к протоколу анкеты (например, PNG-схема клиента). */
export interface HowProtocolAttachment {
    fileName: string;
    caption: string;
    dataUrl: string;
}

/** Состояние заполнения анкеты. */
export interface HowQuestionnaireState {
    respondent: string;
    company: string;
    answers: Record<string, HowAnswer>;
}
