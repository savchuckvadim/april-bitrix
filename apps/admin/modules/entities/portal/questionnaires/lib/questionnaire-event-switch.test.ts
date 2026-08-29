import { describe, expect, it } from 'vitest';
import {
    QUESTIONNAIRE_EVENT_SWITCH_CODE,
    findQuestionnaireEventSwitch,
    formatDisabledEventTypes,
    isQuestionnaireSilencedByEventTypes,
    parseDisabledEventTypes,
    toggleDisabledEventType,
} from './questionnaire-event-switch';
import type { PortalAppSettingsBlock } from '@/modules/entities/portal/app-settings';
import type { PortalQuestionnaireCondition } from '../model';

/** Значение настройки: в контракте оно описано шире, чем приезжает. */
type SettingValue = PortalAppSettingsBlock['settings'][number]['default'];

/** Блок настроек приложения, каким его отдаёт бэк. */
const block = (
    value: string | null,
    appCode: PortalAppSettingsBlock['appCode'] = 'event-sales',
): PortalAppSettingsBlock => ({
    appCode,
    settings: [
        {
            code: QUESTIONNAIRE_EVENT_SWITCH_CODE,
            name: 'Анкеты выключены для типов события',
            description: 'CSV кодов типов события.',
            type: 'string',
            default: '' as unknown as SettingValue,
            stored: value !== null,
            value: value as unknown as SettingValue,
            isList: true,
            options: [
                { code: 'presentation', name: 'Презентация' },
                { code: 'hot', name: 'Решение' },
            ],
        },
    ],
});

describe('parseDisabledEventTypes', () => {
    it('разбирает CSV, убирает пробелы и дубли', () => {
        expect(parseDisabledEventTypes(' presentation , hot,hot ')).toEqual([
            'presentation',
            'hot',
        ]);
    });

    it('всё, что не строка, считает «ничего не выключено»', () => {
        expect(parseDisabledEventTypes(null)).toEqual([]);
        expect(parseDisabledEventTypes(undefined)).toEqual([]);
        expect(parseDisabledEventTypes({})).toEqual([]);
        expect(parseDisabledEventTypes('')).toEqual([]);
    });
});

describe('findQuestionnaireEventSwitch', () => {
    it('находит ключ и приложение, в котором он лежит', () => {
        const found = findQuestionnaireEventSwitch([block('presentation')]);

        expect(found?.appCode).toBe('event-sales');
        expect(found?.code).toBe(QUESTIONNAIRE_EVENT_SWITCH_CODE);
        expect(found?.disabled).toEqual(['presentation']);
    });

    it('без ключа не выдумывает приложение', () => {
        expect(findQuestionnaireEventSwitch([])).toBeNull();
        expect(findQuestionnaireEventSwitch(undefined)).toBeNull();
    });
});

describe('toggleDisabledEventType и formatDisabledEventTypes', () => {
    it('выключает и включает тип события, не трогая остальные', () => {
        expect(toggleDisabledEventType(['hot'], 'presentation', true)).toEqual([
            'hot',
            'presentation',
        ]);
        expect(
            toggleDisabledEventType(['hot', 'presentation'], 'hot', false),
        ).toEqual(['presentation']);
    });

    it('повторное выключение не плодит дубль', () => {
        expect(toggleDisabledEventType(['hot'], 'hot', true)).toEqual(['hot']);
    });

    it('пустой список уезжает сбросом ключа, а не пустой строкой', () => {
        expect(formatDisabledEventTypes(['hot', 'presentation'])).toBe(
            'hot,presentation',
        );
        expect(formatDisabledEventTypes([])).toBeNull();
    });
});

describe('isQuestionnaireSilencedByEventTypes', () => {
    const conditions = (
        ...list: PortalQuestionnaireCondition[]
    ): PortalQuestionnaireCondition[] => list;

    it('гасит анкету, когда выключены все типы её условия', () => {
        expect(
            isQuestionnaireSilencedByEventTypes(
                conditions({ kind: 'reportType', values: ['presentation'] }),
                ['presentation'],
            ),
        ).toBe(true);
    });

    it('оставляет анкету, у которой есть невыключенная альтернатива', () => {
        // Значения условия объединяются по ИЛИ: пройти шлагбаум ещё есть чем.
        expect(
            isQuestionnaireSilencedByEventTypes(
                conditions({
                    kind: 'reportType',
                    values: ['presentation', 'hot'],
                }),
                ['presentation'],
            ),
        ).toBe(false);
    });

    it('«Презентация проведена» гасится выключением презентации', () => {
        expect(
            isQuestionnaireSilencedByEventTypes(
                conditions({ kind: 'presentationDone', values: [] }),
                ['presentation'],
            ),
        ).toBe(true);
    });

    it('анкету без условий по типу события выключатель не трогает', () => {
        expect(
            isQuestionnaireSilencedByEventTypes(
                conditions({ kind: 'workStatus', values: ['inJob'] }),
                ['presentation', 'hot'],
            ),
        ).toBe(false);
    });
});
