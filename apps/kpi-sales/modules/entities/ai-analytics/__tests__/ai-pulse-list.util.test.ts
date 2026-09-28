import { describe, expect, it } from 'vitest';
import type { AiPulseAlert } from '../model';
import { AI_ALERT_KIND } from '../lib/ai-pulse.data';
import {
    AI_PULSE_ALERTS_COLLAPSED_MAX,
    AI_PULSE_ALERTS_EMPTY,
    AI_PULSE_ALERTS_FILTER,
    aiAlertActionLine,
    aiAlertHintLines,
    aiAlertLink,
    aiPulseAlertsEmptyText,
    aiPulseAlertsFilterOptions,
    aiPulseAlertsToggleLabel,
    buildAiPulseAlertsView,
    defaultAiPulseAlertsFilter,
    filterAiPulseAlerts,
    isAiPulseAlertsFilter,
} from '../lib/ai-pulse-list.util';

const alert = (
    id: string,
    overrides: Partial<AiPulseAlert> = {},
): AiPulseAlert => ({
    managerId: '7',
    transcriptionId: id,
    kind: 'promise',
    quote: '',
    callStartedAt: `2026-09-${id.padStart(2, '0')}T10:00:00Z`,
    handled: false,
    link: null,
    ...overrides,
});

/** 8 сигналов: 3 отработаны, 5 нет. */
const ALERTS = [
    alert('1', { handled: true }),
    alert('2'),
    alert('3', { handled: true }),
    alert('4'),
    alert('5'),
    alert('6', { handled: true }),
    alert('7'),
    alert('8'),
];

describe('фильтр «Не отработано / Все»', () => {
    it('по умолчанию — неотработанные, пока они есть; все отработаны — «Все»', () => {
        expect(defaultAiPulseAlertsFilter(ALERTS)).toBe(
            AI_PULSE_ALERTS_FILTER.UNHANDLED,
        );
        expect(
            defaultAiPulseAlertsFilter([alert('1', { handled: true })]),
        ).toBe(AI_PULSE_ALERTS_FILTER.ALL);
        expect(defaultAiPulseAlertsFilter([])).toBe(AI_PULSE_ALERTS_FILTER.ALL);
    });

    it('фильтр оставляет только неотработанные либо всё', () => {
        expect(
            filterAiPulseAlerts(ALERTS, AI_PULSE_ALERTS_FILTER.UNHANDLED).map(
                item => item.transcriptionId,
            ),
        ).toEqual(['2', '4', '5', '7', '8']);
        expect(filterAiPulseAlerts(ALERTS, AI_PULSE_ALERTS_FILTER.ALL)).toHaveLength(
            8,
        );
    });

    it('сегменты со счётчиками, значения проходят гард', () => {
        const options = aiPulseAlertsFilterOptions(ALERTS);
        expect(options.map(option => option.label)).toEqual([
            'Не отработано (5)',
            'Все (8)',
        ]);
        for (const option of options) {
            expect(isAiPulseAlertsFilter(option.value)).toBe(true);
        }
        expect(isAiPulseAlertsFilter('weird')).toBe(false);
    });
});

describe('свёрнутый и развёрнутый список', () => {
    it('свёрнуто — не больше пяти строк, неотработанные сверху и новые выше', () => {
        const view = buildAiPulseAlertsView(ALERTS, {
            filter: AI_PULSE_ALERTS_FILTER.ALL,
            expanded: false,
        });
        expect(AI_PULSE_ALERTS_COLLAPSED_MAX).toBe(5);
        expect(view.rows.map(item => item.transcriptionId)).toEqual([
            '8',
            '7',
            '5',
            '4',
            '2',
        ]);
        expect(view).toMatchObject({ total: 8, hidden: 3, canToggle: true });
        expect(aiPulseAlertsToggleLabel(view, false)).toBe('Показать все 8');
    });

    it('развёрнуто — все строки фильтра, отработанные в хвосте', () => {
        const view = buildAiPulseAlertsView(ALERTS, {
            filter: AI_PULSE_ALERTS_FILTER.ALL,
            expanded: true,
        });
        expect(view.rows.map(item => item.transcriptionId)).toEqual([
            '8',
            '7',
            '5',
            '4',
            '2',
            '6',
            '3',
            '1',
        ]);
        expect(view.hidden).toBe(0);
        expect(aiPulseAlertsToggleLabel(view, true)).toBe('Свернуть');
    });

    it('строк не больше порога — сворачивать нечего', () => {
        const view = buildAiPulseAlertsView(ALERTS, {
            filter: AI_PULSE_ALERTS_FILTER.UNHANDLED,
            expanded: false,
        });
        expect(view).toMatchObject({ total: 5, hidden: 0, canToggle: false });
    });

    it('пустой список: без сигналов и когда всё отработано', () => {
        expect(aiPulseAlertsEmptyText([], AI_PULSE_ALERTS_FILTER.UNHANDLED)).toBe(
            AI_PULSE_ALERTS_EMPTY.none,
        );
        expect(
            aiPulseAlertsEmptyText(
                [alert('1', { handled: true })],
                AI_PULSE_ALERTS_FILTER.UNHANDLED,
            ),
        ).toBe(AI_PULSE_ALERTS_EMPTY.allHandled);
        expect(
            aiPulseAlertsEmptyText(
                [alert('1', { handled: true })],
                AI_PULSE_ALERTS_FILTER.ALL,
            ),
        ).toBe(AI_PULSE_ALERTS_EMPTY.none);
    });
});

describe('ссылка на разбор и «что сделать»', () => {
    it('строка — ссылка; null, пустая строка и отсутствующее поле (старый кэш) — нет', () => {
        expect(aiAlertLink(alert('1', { link: 'https://portal/x/1' }))).toBe(
            'https://portal/x/1',
        );
        expect(aiAlertLink(alert('1', { link: null }))).toBeNull();
        expect(aiAlertLink(alert('1', { link: '  ' }))).toBeNull();
        const legacy: Partial<AiPulseAlert> = {};
        expect(aiAlertLink(legacy as Pick<AiPulseAlert, 'link'>)).toBeNull();
    });

    it('у каждого вида сигнала есть смысл и действие по-русски; подсказка — смысл, затем «Что сделать»', () => {
        for (const [kind, view] of Object.entries(AI_ALERT_KIND)) {
            expect(view.hint).toMatch(/^[А-ЯЁ]/);
            expect(view.action).toMatch(/^[А-ЯЁ]/);
            const lines = aiAlertHintLines(kind as keyof typeof AI_ALERT_KIND);
            expect(lines).toEqual([
                view.hint,
                `Что сделать: ${view.action}`,
            ]);
        }
        expect(aiAlertActionLine('promise')).toBe(
            'Что сделать: Проверьте, выполнено ли обещание клиенту, и обсудите с менеджером',
        );
        expect(aiAlertActionLine('urgent')).toBe(
            'Что сделать: Разберите звонок с менеджером в ближайший день',
        );
    });
});
