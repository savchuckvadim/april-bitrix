/**
 * Протокол по анкете калибровки: заголовки разделов, подписи пустых ответов
 * по виду вопроса, многострочный текст, подпись страницы. Плюс регрессия:
 * анкеты внедрения без разделов печатаются как раньше.
 */

import { describe, expect, it } from 'vitest';
import { CALIBRATION_BRIEF_SECTIONS } from '../constants/calibration-brief-sections';
import {
    CALIBRATION_QUESTION_ID,
    CALIBRATION_QUESTIONNAIRE,
} from '../constants/calibration-questionnaire';
import { HOW_QUESTIONNAIRES } from '../constants/questionnaires';
import { HowQuestionnaireState } from '../constants/types';
import { buildProtocol } from './build-protocol';

const EMPTY: HowQuestionnaireState = {
    company: '',
    respondent: '',
    answers: {},
};

describe('протокол брифа калибровки', () => {
    it('содержит заголовки всех двенадцати разделов в порядке брифа', () => {
        const protocol = buildProtocol(CALIBRATION_QUESTIONNAIRE, EMPTY);
        let cursor = 0;
        Object.values(CALIBRATION_BRIEF_SECTIONS).forEach((title) => {
            const position = protocol.indexOf(`== ${title} ==`, cursor);
            expect(position, title).toBeGreaterThan(-1);
            cursor = position;
        });
    });

    it('пустой ответ подписан по виду вопроса', () => {
        const protocol = buildProtocol(CALIBRATION_QUESTIONNAIRE, EMPTY);
        expect(protocol).toMatch(/Адрес портала Битрикс24: НЕ ЗАПОЛНЕНО/);
        expect(protocol).toMatch(/Результативный звонок: НЕ ВЫБРАНО/);
    });

    it('свободные ответы и комментарии попадают в текст, многострочные — с отступом', () => {
        const protocol = buildProtocol(CALIBRATION_QUESTIONNAIRE, {
            company: 'ООО Ромашка',
            respondent: 'Иванова, РОП',
            answers: {
                [CALIBRATION_QUESTION_ID.portalDomain]: {
                    custom: 'romashka.bitrix24.ru',
                },
                stages: { custom: 'Показ → Презентация\nДоработка → Решение' },
                'effective-call': {
                    choice: 'отметка менеджера в CRM',
                    comment: 'и дата контакта',
                },
            },
        });
        expect(protocol).toContain('Организация: ООО Ромашка');
        expect(protocol).toContain('Заполнил: Иванова, РОП');
        expect(protocol).toContain('romashka.bitrix24.ru');
        expect(protocol).toContain(
            'Показ → Презентация\n   Доработка → Решение',
        );
        expect(protocol).toContain(
            'Результативный звонок: отметка менеджера в CRM',
        );
        expect(protocol).toContain('   Комментарий: и дата контакта');
        expect(protocol).toContain('«AI для отдела продаж → Брифы»');
    });

    it('нумерация вопросов сквозная и совпадает с количеством вопросов', () => {
        const protocol = buildProtocol(CALIBRATION_QUESTIONNAIRE, EMPTY);
        const total = CALIBRATION_QUESTIONNAIRE.questions.length;
        expect(protocol).toMatch(new RegExp(`^${total}\\. `, 'm'));
        expect(protocol).not.toMatch(new RegExp(`^${total + 1}\\. `, 'm'));
    });
});

describe('протокол анкеты внедрения (регрессия)', () => {
    it('без разделов, с прежней подписью страницы', () => {
        const protocol = buildProtocol(HOW_QUESTIONNAIRES.process, EMPTY);
        expect(protocol).not.toContain('== ');
        expect(protocol).toContain('1. Как менеджеры отчитываются о звонках?: НЕ ВЫБРАНО');
        expect(protocol).toContain('«Как мы работаем → Внедрение»');
    });
});
