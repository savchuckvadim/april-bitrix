import { describe, expect, it } from 'vitest';
import {
    buildQuestionnaireRows,
    describeConditions,
    describePlace,
    formatUpdatedAt,
    optionName,
} from './questionnaire-list-view';
import { questionnaireSchemaFixture as schema } from './questionnaire-schema.fixture';
import { questionnaire } from './questionnaire.fixture';
import { unknownCode } from './unknown-code.fixture';
import type { PortalQuestionnaireListItem } from '../model';

const listItem = (
    patch: Partial<PortalQuestionnaireListItem> = {},
): PortalQuestionnaireListItem => ({
    id: 'q-1',
    appCode: 'event-sales',
    code: 'plan_basics',
    title: 'Что узнать до звонка',
    purpose: 'plan',
    place: 'plan',
    itemsCount: 3,
    issuesCount: 0,
    isActive: true,
    sort: 500,
    version: 4,
    updatedAt: null,
    ...patch,
});

describe('optionName', () => {
    it('переводит код в название из реестра', () => {
        expect(optionName(schema.purposes, 'plan')).toBe('Для планирования');
    });

    it('незнакомый код показывает как есть — реестр бэка мог уехать вперёд', () => {
        expect(optionName(schema.purposes, 'unknown')).toBe('unknown');
    });

    it('пустой код даёт пустую подпись', () => {
        expect(optionName(schema.purposes, null)).toBe('');
    });
});

describe('describePlace', () => {
    it('колонка карточки берётся из реестра колонок', () => {
        expect(describePlace('plan', schema)).toBe('Колонка «Планируем»');
        expect(describePlace('report', schema)).toBe('Колонка «Отчёт»');
    });

    it('пустая колонка означает модалку: у карточки колонка всегда задана', () => {
        expect(describePlace(null, schema)).toBe('Модалкой перед отправкой');
    });
});

describe('describeConditions', () => {
    it('собирает чипс из названия условия и названий значений', () => {
        const [chip] = describeConditions(
            [{ kind: 'planType', values: ['warm', 'presentation'] }],
            schema,
        );

        expect(chip?.kind).toBe('planType');
        expect(chip?.label).toBe(
            'Тип планируемого события: Звонок, Презентация',
        );
    });

    it('условие без значений остаётся одним словом', () => {
        const [chip] = describeConditions([{ kind: 'always' }], schema);

        expect(chip?.label).toBe('Всегда');
        expect(chip?.title).toBe(
            'Без условий. Значения не задаются — анкета видна на каждом ' +
                'экране своего назначения.',
        );
    });

    it('незнакомый вид условия показывает сырой код, а не пустоту', () => {
        // Реестр бэка расширяется раньше, чем прогоняется orval: вид
        // условия, которого фронт ещё не знает, приезжает по сети.
        const [chip] = describeConditions(
            [unknownCode({ kind: 'phaseOfMoon', values: ['full'] })],
            schema,
        );

        expect(chip?.label).toBe('phaseOfMoon: full');
    });

    it('без реестра подписей нет — остаются коды', () => {
        const [chip] = describeConditions(
            [{ kind: 'planType', values: ['warm'] }],
            undefined,
        );

        expect(chip?.label).toBe('planType: warm');
    });
});

describe('formatUpdatedAt', () => {
    it('без даты — прочерк', () => {
        expect(formatUpdatedAt(null)).toBe('—');
    });

    it('мусор вместо даты не роняет строку', () => {
        expect(formatUpdatedAt('не дата')).toBe('—');
    });

    it('дата сохранения превращается в читаемую строку', () => {
        expect(formatUpdatedAt('2026-08-27T10:15:00.000Z')).toContain('26');
    });
});

describe('buildQuestionnaireRows', () => {
    it('подписи строки берутся из реестра', () => {
        const [row] = buildQuestionnaireRows([listItem()], new Map(), schema);

        expect(row?.purposeLabel).toBe('Для планирования');
        expect(row?.placeLabel).toBe('Колонка «Планируем»');
        expect(row?.itemsCount).toBe(3);
    });

    it('без состава условий нет, а переключатель ждёт загрузку', () => {
        const [row] = buildQuestionnaireRows([listItem()], new Map(), schema);

        expect(row?.isDetailLoading).toBe(true);
        expect(row?.conditions).toEqual([]);
        expect(row?.toggleBlockReason).toBeNull();
    });

    it('пришедший состав даёт чипсы условий', () => {
        const detail = questionnaire();
        const [row] = buildQuestionnaireRows(
            [listItem({ id: detail.id })],
            new Map([[detail.id, detail]]),
            schema,
        );

        expect(row?.isDetailLoading).toBe(false);
        expect(row?.conditions.map(chip => chip.kind)).toEqual(['planType']);
        expect(row?.toggleBlockReason).toBeNull();
    });

    it('пустой список даёт пустую таблицу', () => {
        expect(buildQuestionnaireRows(undefined, new Map(), schema)).toEqual(
            [],
        );
    });
});
