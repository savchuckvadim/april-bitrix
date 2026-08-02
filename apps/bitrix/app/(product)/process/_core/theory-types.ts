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

export type TheoryBlock =
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
