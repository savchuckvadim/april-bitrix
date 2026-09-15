/**
 * Блоки повествовательной части — раздела «Теория».
 *
 * Здесь мы не показываем схему, а объясняем, почему она такая. Форма врезок
 * важнее оформления: именно она заставляет дочитать до решения, а не проскочить
 * взглядом, как проскакивают обычную плашку-примечание.
 *
 * Вторая группа блоков — справочные (`screen`, `table`, `steps`, `list`,
 * `note`, `diagram`, `code`, `glossary`, `readiness`, `links`,
 * `questionnaire`): их требует база знаний, где рядом с рассуждением стоят
 * инструкция, таблица настроек, место под скрин и форма под заполнение.
 * Рендер справочных блоков переиспользует движок `how-we-work`.
 */

import type { HowQuestionnaireId } from '../../how-we-work/constants/types';
import type { ProcessConfig } from './types';

/** Позиция в споре: у неё всегда есть носитель, иначе спор абстрактный. */
export interface DiscoursePosition {
    /** Чей голос: «Менеджер», «Руководитель», «Администратор». */
    who: string;
    text: string;
}

/**
 * Связка «свойство → что это значит → что даёт».
 *
 * Нужна только на обзорной странице: там читатель ещё не знает, зачем ему
 * читать дальше, и голое перечисление возможностей ему ничего не говорит.
 * Внутри теории такие блоки не используются — там объясняют, а не продают.
 */
export interface BenefitBlock {
    kind: 'benefit';
    feature: string;
    meaning: string;
    gain: string;
}

/** Готовность куска модели — то же различие, что на схеме. */
export type TheoryReadiness = 'live' | 'wip' | 'open';

/** Колонка сравнения сущностей: свои стадии, свой статус, чужие статусы. */
export interface EntityColumn {
    label: string;
    hint: string;
    /** Рабочие стадии — те, на которых сущность ещё в работе. */
    working: string[];
    /** Положительные финалы. */
    positive: string[];
    /** Отрицательные финалы. */
    negative: string[];
    /** Собственный статус работы, если он есть отдельно от стадии. */
    ownStatus: string;
    /** Что сущность показывает про связанные с ней сущности. */
    linked: string[];
    readiness: TheoryReadiness;
}

/** Соотношение сторон места под скрин. */
export type TheoryScreenAspect = '16:9' | '4:3' | 'phone';

/**
 * Место под скриншот интерфейса. Пока картинки нет — рамка с подписью
 * «СКРИН: …», чтобы владелец снимал по списку; с `src` — сама картинка.
 */
export interface TheoryScreen {
    /** Что должно быть на скриншоте. */
    label: string;
    aspect?: TheoryScreenAspect;
    /** Путь к картинке в `public/`; не задан — плейсхолдер. */
    src?: string;
}

/** Тон примечания: `neutral` — без окраски, остальные — по смыслу. */
export type TheoryNoteTone = 'good' | 'warn' | 'bad' | 'neutral';

/** Шаг нумерованной инструкции; скрин — необязательная иллюстрация шага. */
export interface TheoryStep {
    title: string;
    text: string;
    screen?: TheoryScreen;
}

/**
 * Ссылка-действие под текстом: версия для печати, файл брифа, соседняя глава.
 * Проза ссылок не поддерживает намеренно — адрес в тексте читается хуже
 * кнопки и хуже озвучивается скринридером.
 */
export interface TheoryLink {
    label: string;
    href: string;
    /** Пояснение под подписью: что откроется и зачем. */
    note?: string;
    /** Ссылка на файл в `public/`: скачиваем, а не переходим по маршруту. */
    download?: boolean;
}

/** Термин словаря; `href` ведёт на главу, где термин раскрыт. */
export interface TheoryGlossaryItem {
    term: string;
    definition: string;
    href?: string;
}

export type TheoryBlock =
    | BenefitBlock
    | {
          kind: 'entities';
          title: string;
          intro: string;
          columns: EntityColumn[];
      }
    | {
          kind: 'checklist';
          title: string;
          intro: string;
          items: {
              question: string;
              answer: string;
              state: TheoryReadiness;
          }[];
      }
    | { kind: 'lead'; text: string }
    | { kind: 'heading'; text: string }
    | { kind: 'paragraph'; text: string }
    /**
     * Контринтуитивное. Три такта в жёстком порядке: во что верится → как
     * на самом деле → чем это оборачивается.
     */
    | {
          kind: 'obvious';
          intuition: string;
          reality: string;
          consequence: string;
      }
    /**
     * Дискурс — конфликтная развилка. Вопрос, который всё равно будет решён:
     * либо спокойно сейчас, либо конфликтом потом.
     */
    | {
          kind: 'discourse';
          question: string;
          positions: DiscoursePosition[];
          price: string;
          /** Пусто — значит ответа пока нет, и это надо сказать прямо. */
          recommendation?: string;
          /** Конфигурация, которую поставит кнопка «Посмотреть на схеме». */
          preview?: Partial<ProcessConfig>;
      }
    /** Как бывает делают — без оценок: почему так сложилось и где ломается. */
    | { kind: 'practice'; text: string }
    /** Опасность — риск и способ его обойти. */
    | { kind: 'danger'; text: string }
    /**
     * Виджет-сценарий: читатель переключает условие и видит следствие.
     * Объясняет, а не требует решения — этим отличается от дискурса.
     */
    | {
          kind: 'scenario';
          title: string;
          options: { label: string; meaning: string }[];
      }
    /* --- Справочные блоки базы знаний --- */
    | ({ kind: 'screen' } & TheoryScreen)
    /** Таблица; на узком экране прокручивается внутри блока, не страница. */
    | { kind: 'table'; head: string[]; rows: string[][]; caption?: string }
    /** Нумерованная инструкция. */
    | { kind: 'steps'; items: TheoryStep[] }
    | { kind: 'list'; items: string[]; ordered?: boolean }
    | { kind: 'note'; tone: TheoryNoteTone; text: string }
    /** Схема в синтаксисе mermaid. */
    | { kind: 'diagram'; chart: string; caption?: string }
    /** Пример кода: JSON разбора, ключ настройки. */
    | { kind: 'code'; lang: string; code: string; caption?: string }
    | { kind: 'glossary'; items: TheoryGlossaryItem[] }
    /** Ссылки-действия: печатная версия, файл, соседняя глава. */
    | { kind: 'links'; items: TheoryLink[] }
    /**
     * Интерактивная анкета движка «Как мы работаем» по идентификатору из
     * общего реестра: бриф заполняется прямо в главе, а не на отдельной
     * странице.
     */
    | { kind: 'questionnaire'; questionnaireId: HowQuestionnaireId }
    /** Плашка готовности главы: работает, в работе, открыто. */
    | { kind: 'readiness'; state: TheoryReadiness; text: string };

export interface TheoryPageContent {
    slug: string;
    eyebrow: string;
    title: string;
    description: string;
    blocks: TheoryBlock[];
}
