import { describe, expect, it } from 'vitest';
import {
    buildToggleActivePayload,
    getToggleActiveBlockReason,
} from './toggle-active-payload';
import { questionnaire, questionnaireItem } from './questionnaire.fixture';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';

describe('buildToggleActivePayload', () => {
    it('меняет только флаг «Включена»', () => {
        const source = questionnaire({ isActive: true });
        const payload = buildToggleActivePayload(source, false);

        expect(payload.isActive).toBe(false);
        expect(payload.id).toBe(source.id);
        expect(payload.code).toBe(source.code);
        expect(payload.conditions).toEqual(source.conditions);
    });

    it('состав уезжает целиком: сохранение гасит всё, чего нет в теле', () => {
        const source = questionnaire({
            items: [
                questionnaireItem({ id: 'a', code: 'first' }),
                questionnaireItem({ id: 'b', code: 'second' }),
            ],
        });

        expect(
            buildToggleActivePayload(source, false).items.map(
                item => item.code,
            ),
        ).toEqual(['first', 'second']);
    });

    it('вопросу «Автоматически» возвращает носитель из цепочки: бэк требует его на сохранении', () => {
        const payload = buildToggleActivePayload(questionnaire(), false);

        expect(payload.items[0]?.fieldSource).toBe('company');
    });

    it('у жёсткого носителя источник равен самой сущности, а не голове цепочки', () => {
        const source = questionnaire({
            items: [
                questionnaireItem({
                    targetMode: 'entity',
                    targetEntity: 'contact',
                }),
            ],
        });

        expect(
            buildToggleActivePayload(source, false).items[0]?.fieldSource,
        ).toBe('contact');
    });

    it('штатному полю носитель не подставляется — его у поля нет', () => {
        const source = questionnaire({
            items: [
                questionnaireItem({
                    isNative: true,
                    fieldName: 'OPPORTUNITY',
                    fieldType: null,
                    control: 'money',
                }),
            ],
        });

        expect(
            buildToggleActivePayload(source, false).items[0]?.fieldSource,
        ).toBeUndefined();
    });

    it('вопрос вне CRM носителя не получает', () => {
        const source = questionnaire({
            items: [
                questionnaireItem({
                    channel: 'text',
                    control: 'text',
                    fieldName: null,
                    fieldType: null,
                }),
            ],
        });

        expect(
            buildToggleActivePayload(source, false).items[0]?.fieldSource,
        ).toBeUndefined();
    });
});

describe('getToggleActiveBlockReason', () => {
    it('здоровую анкету переключать можно', () => {
        expect(getToggleActiveBlockReason(questionnaire(), schema)).toBeNull();
    });

    it('без реестра причину не выдумываем', () => {
        expect(
            getToggleActiveBlockReason(questionnaire(), undefined),
        ).toBeNull();
    });

    it('анкета без условий показа пересохранение не пройдёт', () => {
        const reason = getToggleActiveBlockReason(
            questionnaire({ conditions: [] }),
            schema,
        );

        expect(reason).toContain('условие показа');
    });

    it('множественное поле запирает переключатель', () => {
        const reason = getToggleActiveBlockReason(
            questionnaire({ items: [questionnaireItem({ isMultiple: true })] }),
            schema,
        );

        expect(reason).toContain('множественные поля');
    });

    it('жёсткий носитель без сущности — тоже причина', () => {
        const reason = getToggleActiveBlockReason(
            questionnaire({
                items: [
                    questionnaireItem({
                        targetMode: 'entity',
                        targetEntity: null,
                    }),
                ],
            }),
            schema,
        );

        expect(reason).toContain('сущность-носитель');
    });

    it('тип отображения, несовместимый с типом поля, переключать не даёт', () => {
        const reason = getToggleActiveBlockReason(
            questionnaire({
                items: [
                    questionnaireItem({
                        control: 'boolean',
                        fieldType: 'date',
                    }),
                ],
            }),
            schema,
        );

        expect(reason).toContain('несовместим');
    });
});
