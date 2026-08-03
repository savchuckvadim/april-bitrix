/**
 * Блоки повествовательной части — раздела «Теория».
 *
 * Здесь мы не показываем схему, а объясняем, почему она такая. Форма врезок
 * важнее оформления: именно она заставляет дочитать до решения, а не проскочить
 * взглядом, как проскакивают обычную плашку-примечание.
 */

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

export type TheoryBlock =
    | BenefitBlock
    | { kind: 'entities'; title: string; intro: string; columns: EntityColumn[] }
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
      };

export interface TheoryPageContent {
    slug: string;
    eyebrow: string;
    title: string;
    description: string;
    blocks: TheoryBlock[];
}
