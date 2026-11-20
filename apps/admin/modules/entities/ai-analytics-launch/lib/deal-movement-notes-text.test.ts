import { describe, expect, it } from 'vitest';
import type { DealMovementNotesSummary, DealMovementRunStatus } from '../model';
import { dealMovementNotesLines } from './deal-movement-notes-text';
import {
    dealMovementChangeView,
    dealMovementPhaseText,
} from './deal-movement-results';

const notes = (
    over: Partial<DealMovementNotesSummary> = {},
): DealMovementNotesSummary => ({
    enabled: true,
    kind: 'comment',
    heldForNight: false,
    planned: 100,
    written: 97,
    failed: 3,
    deferredLimit: 20,
    deferredQuiet: 5,
    texts: 48,
    textsFailed: 2,
    ...over,
});

/** На экран не попадают коды вида записи и режима. */
const CODES = /comment|log_message|dry-run|count|heldForNight/;

describe('записи в ленту словами', () => {
    it('ночной счёт: записано, отложено, не удалось и подсказки', () => {
        const lines = dealMovementNotesLines(notes(), 'count');
        expect(lines).toEqual([
            'Записано в ленту: 97 из 100; отложено: лимит ночи — 20, не чаще раза в 3 дня — 5; не удалось: 3',
            'Подсказок «что сделать»: 48, без подсказки: 2',
        ]);
        expect(lines.join(' ')).not.toMatch(CODES);
    });

    it('подсчёт — сколько записали бы; ручной счёт — сколько ждёт ночи', () => {
        expect(dealMovementNotesLines(notes(), 'dry-run')).toEqual([
            'Записали бы в ленту: 100; отложили бы: лимит ночи — 20, не чаще раза в 3 дня — 5',
        ]);
        expect(
            dealMovementNotesLines(
                notes({ heldForNight: true, planned: 0, written: 0 }),
                'count',
            ),
        ).toEqual([
            'Ручной счёт в ленту не пишет: до ночи отложено записей — 20; не чаще раза в 3 дня — 5',
        ]);
    });

    it('запись выключена — одной строкой', () => {
        expect(
            dealMovementNotesLines(notes({ enabled: false, kind: null }), 'count'),
        ).toEqual(['Запись в ленту сделок выключена.']);
    });
});

describe('пометка и фаза записи в ленту', () => {
    it('смена, записанная в ленту, — с пометкой; старый снимок без поля — без неё', () => {
        const base = {
            dealId: '9041',
            title: 'ООО «Ромашка»',
            assignedById: 7,
            amount: null,
            from: 'moving' as const,
            to: 'stuck' as const,
            reasons: [],
        };
        expect(dealMovementChangeView({ ...base, notified: true }).notified).toBe(
            true,
        );
        expect(dealMovementChangeView(base).notified).toBe(false);
    });

    it('идёт запись — фаза подписью, а не кодом', () => {
        const run: DealMovementRunStatus = {
            domain: 'garant.bitrix24.ru',
            mode: 'count',
            requestedBy: 'nightly',
            phase: 'notes',
            startedAt: '2026-11-17T23:27:00.000Z',
            updatedAt: '2026-11-17T23:40:00.000Z',
            finished: false,
            openTotal: 9012,
            evaluated: 9012,
            capped: false,
            baseline: false,
            firstSeen: 0,
            byStatus: {
                moving: 1,
                stuck: 1,
                abandoned: 0,
                rolled_back: 0,
                at_risk: 0,
            },
            changed: 1,
            snapshotDay: null,
            warnings: [],
            error: null,
        };
        expect(
            dealMovementPhaseText(run, new Date('2026-11-17T23:45:00.000Z')),
        ).toBe('Идёт: пишет в ленту сделок');
        expect(
            dealMovementPhaseText(
                { ...run, phase: 'digest' },
                new Date('2026-11-17T23:45:00.000Z'),
            ),
        ).toBe('Идёт: рассылает сводку руководителям');
    });
});
