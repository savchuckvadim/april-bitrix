import type { TheoryBlock, TheoryPageContent } from '../theory-types';

export interface OpenDecision {
    /** Заголовок страницы, где развилка разобрана подробно. */
    source: string;
    question: string;
    positions: string[];
    price: string;
}

/**
 * Развилки, у которых пока нет ответа.
 *
 * Врезка «Дискурс» без рекомендации говорит читателю: «вопрос уходит в лист
 * решений внедрения». Лист — вот он; иначе врезка обещает то, чего нет.
 *
 * Решённые развилки сюда не попадают намеренно: выбранный ответ и так виден
 * в разделе «Принятые решения», а смешивать решённое с нерешённым — верный
 * способ получить документ, который никто не дочитает.
 */
export const openDecisions = (
    pages: TheoryPageContent[] = [],
): OpenDecision[] =>
    pages.flatMap(page =>
        page.blocks
            .filter(
                (block): block is Extract<TheoryBlock, { kind: 'discourse' }> =>
                    block.kind === 'discourse' && !block.recommendation,
            )
            .map(block => ({
                source: page.title,
                question: block.question,
                positions: block.positions.map(
                    position => `${position.who}: ${position.text}`,
                ),
                price: block.price,
            })),
    );
