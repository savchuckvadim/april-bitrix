import { describe, expect, it } from 'vitest';
import {
    composeSurveyBlockValue,
    countAnsweredSub,
    EMPTY_SURVEY_BLOCK,
    isSurveyBlockAnswered,
} from './check-presentation.blocks';

const QUESTIONS = [
    'Какие задачи решает клиент?',
    'Какую информацию важно отслеживать?',
    'Что из функционала особенно важно?',
];

describe('composeSurveyBlockValue', () => {
    it('нет ответов на подвопросы — ровно то, что набрал менеджер', () => {
        expect(
            composeSurveyBlockValue(QUESTIONS, {
                ...EMPTY_SURVEY_BLOCK,
                text: '  Клиент хочет замену Консультанта  ',
            }),
        ).toBe('Клиент хочет замену Консультанта');
    });

    it('отвеченные подвопросы — построчно «N. Подвопрос — ответ», номер по блоку', () => {
        expect(
            composeSurveyBlockValue(QUESTIONS, {
                text: '',
                sub: { 2: 'Проверка контрагентов', 0: 'Договоры' },
                expanded: true,
            }),
        ).toBe(
            [
                '1. Какие задачи решает клиент? — Договоры',
                '3. Что из функционала особенно важно? — Проверка контрагентов',
            ].join('\n'),
        );
    });

    it('собственный текст идёт первой строкой перед подвопросами', () => {
        expect(
            composeSurveyBlockValue(QUESTIONS, {
                text: 'Общее впечатление хорошее',
                sub: { 1: 'Судебную практику' },
                expanded: true,
            }),
        ).toBe(
            'Общее впечатление хорошее\n2. Какую информацию важно отслеживать? — Судебную практику',
        );
    });

    it('пробельные ответы не считаются ответами', () => {
        expect(
            composeSurveyBlockValue(QUESTIONS, {
                text: '   ',
                sub: { 0: '  ', 1: '' },
                expanded: true,
            }),
        ).toBe('');
    });

    it('свёрнутость на значение не влияет — подответы остаются', () => {
        const draft = { text: '', sub: { 0: 'Договоры' }, expanded: false };

        expect(composeSurveyBlockValue(QUESTIONS, draft)).toBe(
            '1. Какие задачи решает клиент? — Договоры',
        );
    });
});

describe('обязательность родителя', () => {
    it('пустой блок не отвечен', () => {
        expect(isSurveyBlockAnswered(EMPTY_SURVEY_BLOCK)).toBe(false);
        expect(countAnsweredSub(EMPTY_SURVEY_BLOCK)).toBe(0);
    });

    it('хоть один подвопрос закрывает обязательность', () => {
        const draft = { text: '', sub: { 2: 'Да' }, expanded: true };

        expect(isSurveyBlockAnswered(draft)).toBe(true);
        expect(countAnsweredSub(draft)).toBe(1);
    });

    it('текст в строке Вопроса закрывает обязательность без подвопросов', () => {
        expect(
            isSurveyBlockAnswered({ ...EMPTY_SURVEY_BLOCK, text: 'ответ' }),
        ).toBe(true);
    });
});
