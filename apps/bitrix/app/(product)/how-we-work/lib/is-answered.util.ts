import { HowAnswer } from '../constants/types';

/**
 * Отвечен ли вопрос: выбран вариант или заполнено свободное поле.
 *
 * Одно определение на весь движок — им считается прогресс «отвечено N из M»
 * и им же проверяются обязательные вопросы перед отправкой. Комментарий
 * ответом не считается: он поясняет ответ, а не заменяет его.
 */
export const isAnswered = (answer: HowAnswer | undefined): boolean =>
    Boolean(answer?.choice || answer?.custom?.trim());
