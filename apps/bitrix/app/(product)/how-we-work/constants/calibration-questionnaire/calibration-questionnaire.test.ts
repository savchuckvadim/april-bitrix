/**
 * Состав онлайн-брифа калибровки: каждый раздел печатного брифа должен быть
 * представлен вопросами, каждый наш тип звонка — своим вопросом, а три
 * существующие анкеты внедрения — остаться прежними по форме.
 */

import { describe, expect, it } from 'vitest';
import { CALIBRATION_BRIEF } from '../../calibration/brief/constants/brief-document';
import {
    CALIBRATION_BRIEF_SECTIONS,
    CALIBRATION_CALL_TYPES,
} from '../calibration-brief-sections';
import { HOW_QUESTIONNAIRES } from '../questionnaires';
import { HowQuestionnaireId } from '../types';
import {
    CALIBRATION_QUESTION_ID,
    CALIBRATION_QUESTIONNAIRE,
    CALL_TYPE_QUESTION_PREFIX,
} from './index';

const questions = CALIBRATION_QUESTIONNAIRE.questions;
const byId = (id: string) => questions.find((question) => question.id === id);

describe('разделы брифа', () => {
    it('каждый раздел печатного брифа имеет хотя бы один вопрос', () => {
        const groups = new Set(questions.map((question) => question.group));
        CALIBRATION_BRIEF.sections.forEach((section) => {
            expect(groups.has(section.title), section.title).toBe(true);
        });
        expect(CALIBRATION_BRIEF.sections).toHaveLength(
            Object.keys(CALIBRATION_BRIEF_SECTIONS).length,
        );
    });

    it('вопросы одного раздела идут подряд и в порядке брифа', () => {
        const order: string[] = [];
        questions.forEach((question) => {
            if (order[order.length - 1] !== question.group) {
                order.push(question.group ?? '');
            }
        });
        expect(order).toEqual(Object.values(CALIBRATION_BRIEF_SECTIONS));
    });

    it('идентификаторы вопросов уникальны', () => {
        const ids = questions.map((question) => question.id);
        expect(new Set(ids).size).toBe(ids.length);
    });
});

describe('обязательные темы брифа', () => {
    it('реквизиты: домен портала — ссылка, контакт — свободный текст', () => {
        expect(byId(CALIBRATION_QUESTION_ID.portalDomain)?.kind).toBe('link');
        expect(byId(CALIBRATION_QUESTION_ID.contact)?.kind).toBe('text');
    });

    it('по каждому нашему типу звонка есть вопрос с фиксацией в CRM', () => {
        CALIBRATION_CALL_TYPES.forEach((callType, index) => {
            const question = byId(`${CALL_TYPE_QUESTION_PREFIX}${index + 1}`);
            expect(question?.title, callType).toContain(callType);
            expect(question?.options.map((option) => option.value)).toContain(
                'да',
            );
        });
    });

    it.each([
        ['refine-vs-decision', 'text'],
        ['effective-call', 'choice'],
        ['unique-presentation', 'choice'],
        ['hot-client', 'choice'],
        ['red-lines', 'text'],
        ['checklist-tail', 'choice'],
        ['checklist-5k', 'choice'],
        ['materials-folder', 'link'],
        ['reference-1-link', 'link'],
        ['reference-2-link', 'link'],
        ['exclude-departments', 'text'],
        ['schedule', 'text'],
        ['consent-access', 'choice'],
        ['consent-pooling', 'choice'],
        ['notes', 'text'],
    ])('вопрос %s есть и имеет вид %s', (id, kind) => {
        const question = byId(id);
        expect(question).toBeDefined();
        expect(question?.kind ?? 'choice').toBe(kind);
    });

    it('эталонных звонков ровно два', () => {
        const links = questions.filter((question) =>
            /^reference-\d+-link$/.test(question.id),
        );
        expect(links).toHaveLength(2);
    });

    it('у свободных вопросов нет вариантов, у вопросов с выбором — есть', () => {
        questions.forEach((question) => {
            const free = question.kind === 'text' || question.kind === 'link';
            expect(question.options.length > 0, question.id).toBe(!free);
        });
    });

    it('отправка ссылается на существующий вопрос с доменом', () => {
        const submit = CALIBRATION_QUESTIONNAIRE.submit;
        expect(submit?.path).toBe('/api/calibration');
        expect(byId(submit?.domainQuestionId ?? '')).toBeDefined();
    });
});

describe('реестр анкет', () => {
    it('ключ реестра совпадает с id анкеты', () => {
        (Object.keys(HOW_QUESTIONNAIRES) as HowQuestionnaireId[]).forEach(
            (key) => expect(HOW_QUESTIONNAIRES[key].id).toBe(key),
        );
    });

    it('анкеты внедрения остались прежними: без разделов, видов и отправки', () => {
        (['process', 'inbound', 'catalogs'] as const).forEach((id) => {
            const questionnaire = HOW_QUESTIONNAIRES[id];
            expect(questionnaire.submit).toBeUndefined();
            questionnaire.questions.forEach((question) => {
                expect(question.kind).toBeUndefined();
                expect(question.group).toBeUndefined();
                expect(question.options.length).toBeGreaterThan(0);
            });
        });
    });
});
