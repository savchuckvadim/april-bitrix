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

/** Финальный CTA страницы. */
export interface HowPageCtaContent {
    /** Заголовок карточки CTA */
    label: string;
    /** Куда ведёт основная кнопка */
    href: string;
    /** Пояснение под заголовком */
    note?: string;
    /**
     * `href` ведёт на файл в `public/`: кнопка скачивает его, а не переходит
     * по маршруту. Не задано — обычная навигация по сайту.
     */
    download?: boolean;
    /** Вторая, необязательная ссылка рядом с основной кнопкой */
    secondary?: { label: string; href: string };
}

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
    cta?: HowPageCtaContent;
}

/** Раздел печатного документа (бриф): заголовок и те же контентные блоки. */
export interface HowDocumentSection {
    title: string;
    blocks: HowContentBlock[];
    /**
     * Начинать печать раздела с новой страницы. Ставим только крупным
     * разделам — иначе документ разъезжается на десяток почти пустых листов.
     */
    pageBreakBefore?: boolean;
}

/** Печатный документ под заполнение (бриф калибровки). */
export interface HowDocumentContent {
    title: string;
    /** Блоки до первого раздела */
    intro: HowContentBlock[];
    sections: HowDocumentSection[];
    /** Блоки после последнего раздела: подписи, куда отправить */
    outro: HowContentBlock[];
}

/**
 * Идентификаторы анкет внедрения и брифов.
 *
 * `calibration` и `call-review` — брифы раздела «AI для отдела продаж»: они
 * показываются на `/ai/briefs` тем же движком, а содержание `call-review`
 * лежит в константах раздела AI.
 */
export type HowQuestionnaireId =
    | 'process'
    | 'inbound'
    | 'catalogs'
    | 'calibration'
    | 'call-review';

/**
 * Вид вопроса. `choice` (по умолчанию) — варианты-кнопки плюс «свой вариант»
 * и комментарий; `text` — свободный многострочный ответ; `link` — одна
 * ссылка (папка, файл, звонок в Битриксе). У `text`/`link` вариантов нет,
 * ответ хранится в `HowAnswer.custom`.
 */
export type HowQuestionnaireQuestionKind = 'choice' | 'text' | 'link';

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
    /** Вид вопроса; не задан — `choice` */
    kind?: HowQuestionnaireQuestionKind;
    /**
     * Раздел анкеты (для длинных анкет вроде брифа). Вопросы одного раздела
     * идут подряд; заголовок раздела рисуется перед первым из них и
     * попадает в протокол.
     */
    group?: string;
    /** Плейсхолдер поля свободного ответа (`text`/`link`) */
    placeholder?: string;
    /**
     * Без ответа на этот вопрос протокол не отправляется: согласие, дата,
     * ссылка на запись. Скачать и скопировать протокол по-прежнему можно —
     * ограничение стоит только на отправке нам.
     */
    required?: boolean;
}

/**
 * Отправка протокола нам прямо со страницы. `path` — маршрут приложения,
 * который пересылает протокол в Telegram; `domainQuestionId` — вопрос,
 * из ответа на который берётся домен портала для темы сообщения.
 */
export interface HowQuestionnaireSubmit {
    path: string;
    domainQuestionId: string;
}

/** Анкета целиком. */
export interface HowQuestionnaire {
    id: HowQuestionnaireId;
    title: string;
    description: string;
    questions: HowQuestionnaireQuestion[];
    /** Заголовок скачиваемого протокола */
    protocolTitle: string;
    /** Название страницы раздела в подписи протокола; не задано — «Внедрение» */
    sourcePage?: string;
    /**
     * Название раздела сайта в подписи протокола; не задано — «Как мы
     * работаем». Задаётся анкетами, переехавшими в другой раздел, чтобы в
     * протоколе стоял адрес, по которому его действительно заполняли.
     */
    sourceSection?: string;
    /** Задано — рядом со «Скачать протокол» появляется «Отправить нам» */
    submit?: HowQuestionnaireSubmit;
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
