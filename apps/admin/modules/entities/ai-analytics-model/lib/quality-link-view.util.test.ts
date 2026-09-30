import { describe, expect, it } from 'vitest';
import { plain } from './plain-text.test-helper';
import type { ModelQualityLink } from '../model';
import { remainingGateRuns, toQualityLinkView } from './quality-link-view.util';

const link = (patch: Partial<ModelQualityLink> = {}): ModelQualityLink => ({
    monthKey: '2026-09',
    generatedAt: '2026-10-03T01:00:00.000Z',
    status: 'estimated',
    reasons: ['se-above-target'],
    sampleN: 412,
    sampleEvents: 96,
    sampleManagers: 7,
    windowDays: 14,
    within: { value: 0.31, ci90: [0.12, 0.48] },
    between: null,
    pooled: { value: 0.28, ci90: [0.1, 0.44] },
    epv: 12.5,
    reliabilityR: 0.82,
    calibrationSlope: { value: 0.94, ci90: [0.7, 1.2] },
    calibrationCoversOne: true,
    placeboPassed: null,
    gatePassedNow: false,
    gateStreak: 1,
    gateMonths: 3,
    published: false,
    timestampLeakOk: true,
    ...patch,
});

const valueOf = (rows: { label: string; value: string }[], label: string) =>
    plain(rows.find(row => row.label === label)?.value ?? '');

describe('toQualityLinkView: связь качества с результатом', () => {
    it('статус, месяц и причины по-русски', () => {
        const view = toQualityLinkView(link());

        expect(view.status.label).toBe('Оценена, не опубликована');
        expect(view.month).toBe('сентябрь 2026');
        expect(view.reasons).toEqual([
            {
                code: 'se-above-target',
                label: 'Погрешность общей оценки выше целевой',
                known: true,
            },
        ]);
    });

    it('выборка: n, события с долей, окно в днях', () => {
        const { sample } = toQualityLinkView(link());

        expect(valueOf(sample, 'Звонков в выборке')).toBe('412');
        expect(valueOf(sample, 'С исходом (КП или счёт)')).toBe('96 (23 %)');
        expect(valueOf(sample, 'Окно исхода')).toBe('14 дней');
        expect(valueOf(sample, 'Событий на параметр')).toBe('12,5');
    });

    it('оценки с интервалами; нет оценки — так и написано', () => {
        const { estimates } = toQualityLinkView(link());

        expect(valueOf(estimates, 'Внутри менеджера')).toBe('0,31 (0,12 – 0,48)');
        expect(valueOf(estimates, 'Между менеджерами')).toBe('нет оценки');
        expect(valueOf(estimates, 'Наклон калибровки')).toBe('0,94 (0,70 – 1,20)');
    });

    it('проверки: null — «не считалась», а не провал', () => {
        const { checks } = toQualityLinkView(link());
        const placebo = checks.find(
            row => row.label === 'Проверка на подставных данных',
        );

        expect(placebo?.value).toBe('не считалась');
        expect(placebo?.tone).toBe('muted');
        expect(valueOf(checks, 'Надёжность оценки качества')).toBe('0,82');
        expect(
            valueOf(toQualityLinkView(link({ reliabilityR: null })).checks, 'Надёжность оценки качества'),
        ).toBe('не измерена');
    });

    it('серия гейта и счётчик до публикации', () => {
        const { gate } = toQualityLinkView(link());

        expect(valueOf(gate, 'Серия пересчётов подряд')).toBe('1 из 3');
        expect(valueOf(gate, 'До публикации')).toBe('ещё 2 пересчёта подряд');
        expect(
            valueOf(
                toQualityLinkView(link({ published: true, gateStreak: 3 })).gate,
                'До публикации',
            ),
        ).toBe('не нужно, уже опубликована');
    });

    it('неизвестный статус с бэка не роняет карточку', () => {
        const view = toQualityLinkView(
            link({ status: 'archived' as ModelQualityLink['status'] }),
        );

        expect(view.status.label).toBe('Неизвестный статус');
    });
});

describe('remainingGateRuns', () => {
    it('опубликована — 0; серия длиннее нужной — 0', () => {
        expect(remainingGateRuns({ published: false, gateStreak: 0, gateMonths: 3 })).toBe(3);
        expect(remainingGateRuns({ published: false, gateStreak: 5, gateMonths: 3 })).toBe(0);
        expect(remainingGateRuns({ published: true, gateStreak: 0, gateMonths: 3 })).toBe(0);
    });
});
