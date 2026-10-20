import { describe, expect, it } from 'vitest';
import { overview } from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import type { AiOverview } from '@/modules/entities/ai-analytics/model';
import {
    aiOverviewComparableFrom,
    buildAiOverviewMetaItems,
} from '../ai-overview-meta.util';

const withMeta = (meta: Partial<AiOverview['meta']>): AiOverview => {
    const base = overview();
    return { ...base, meta: { ...base.meta, ...meta } };
};

const keys = (items: { key: string }[]) => items.map(item => item.key);
const textOf = (items: { key: string; text: string }[], key: string) =>
    items.find(item => item.key === key)?.text;

describe('buildAiOverviewMetaItems — строка над таблицей', () => {
    it('«в оценке X из Y звонков, обработанных AI» с порогом и датой в подсказке', () => {
        const items = buildAiOverviewMetaItems(
            { ...overview(), comparableFrom: '2026-09-25' },
            { minDurationSec: 300 },
        );
        expect(textOf(items, 'analyzed')).toBe(
            'в оценке 40 из 100 звонков, обработанных AI',
        );
        const hint = items.find(item => item.key === 'analyzed')?.hint;
        expect(hint?.lines.join(' ')).toContain('длиннее 300 сек');
        expect(hint?.lines.join(' ')).toContain('не раньше 25.09.2026');
        // Порога нет — словами, без числа.
        const noSec = buildAiOverviewMetaItems(overview(), { minDurationSec: null });
        expect(
            noSec.find(item => item.key === 'analyzed')?.hint?.lines[0],
        ).toContain('не короче порога длительности');
    });

    it('«не по продажам» — только при оценённых звонках; счётчики — только когда больше нуля', () => {
        const full = buildAiOverviewMetaItems(
            withMeta({
                skippedNoManager: 20,
                excludedBeforeComparable: 5,
                disagreementsCount: 2,
            }),
            { minDurationSec: null },
        );
        expect(keys(full)).toEqual([
            'period',
            'analyzed',
            'other',
            'no-manager',
            'before-comparable',
            'disagreements',
            'generated-at',
        ]);
        expect(textOf(full, 'other')).toBe('не по продажам: 10 %');
        expect(textOf(full, 'no-manager')).toBe('сотрудник не определён: 20');
        expect(textOf(full, 'before-comparable')).toBe(
            'разобраны по старым правилам: 5',
        );
        expect(textOf(full, 'disagreements')).toBe('несогласий 2');

        const empty = buildAiOverviewMetaItems(
            withMeta({ analyzedCalls: 0, totalCalls: 20, skippedNoManager: 20 }),
            { minDurationSec: null },
        );
        expect(keys(empty)).toEqual([
            'period',
            'analyzed',
            'no-manager',
            'generated-at',
        ]);
        expect(textOf(empty, 'analyzed')).toBe(
            'в оценке 0 из 20 звонков, обработанных AI',
        );
    });

    it('старый кэш без excludedBeforeComparable — пункта нет; подсказки с «что сделать»', () => {
        const items = buildAiOverviewMetaItems(overview(), { minDurationSec: null });
        expect(keys(items)).not.toContain('before-comparable');
        const noManager = buildAiOverviewMetaItems(
            withMeta({ skippedNoManager: 3 }),
            { minDurationSec: null },
        ).find(item => item.key === 'no-manager');
        expect(noManager?.hint?.lines.join(' ')).toContain('до 23.07.2026');
        expect(noManager?.hint?.lines.join(' ')).toContain('сообщите разработчику');
    });

    it('дата сравнимости: из готовности, иначе из корня, иначе null', () => {
        const base = overview();
        expect(aiOverviewComparableFrom(base)).toBeNull();
        expect(
            aiOverviewComparableFrom({ ...base, comparableFrom: '2026-09-25' }),
        ).toBe('2026-09-25');
        expect(
            aiOverviewComparableFrom({
                ...base,
                readiness: { ...base.readiness, comparableFrom: '2026-09-01' },
                comparableFrom: '2026-09-25',
            }),
        ).toBe('2026-09-01');
    });
});
