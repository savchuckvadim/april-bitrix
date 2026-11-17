import { describe, expect, it } from 'vitest';
import type { DealMovementRunStatus, DealMovementSnapshot } from '../model';
import {
    dealMovementChangesLine,
    dealMovementChangeView,
    dealMovementCountsText,
    dealMovementDayLabel,
    dealMovementMoreText,
    dealMovementOutcome,
    dealMovementPhaseText,
    dealMovementRunHeadline,
    dealMovementRunTotalsText,
    dealMovementShownChanges,
    dealMovementSnapshotHeadline,
    isAwaitedDealMovementDone,
    isDealMovementRunning,
} from './deal-movement-results';

const NOW = new Date('2026-11-18T08:00:00.000Z');

const counts = { moving: 7000, stuck: 1500, rolled_back: 12, at_risk: 500 };

const run = (over: Partial<DealMovementRunStatus> = {}): DealMovementRunStatus => ({
    domain: 'garant.bitrix24.ru',
    mode: 'count',
    requestedBy: 'nightly',
    phase: 'done',
    startedAt: '2026-11-17T23:27:00.000Z',
    updatedAt: '2026-11-18T07:50:00.000Z',
    finished: true,
    openTotal: 9012,
    evaluated: 9012,
    capped: false,
    baseline: false,
    firstSeen: 4,
    byStatus: counts,
    changed: 123,
    snapshotDay: '2026-11-18',
    warnings: [],
    error: null,
    ...over,
});

const change = (index: number) => ({
    dealId: String(9000 + index),
    title: `ООО «Сделка ${index}»`,
    assignedById: 7,
    amount: index === 0 ? 150000 : null,
    from: 'moving' as const,
    to: 'at_risk' as const,
    reasons: ['договорились на 10.11 — контакта после этого не было'],
});

const snapshot = (over: Partial<DealMovementSnapshot> = {}): DealMovementSnapshot => ({
    day: '2026-11-18',
    mode: 'count',
    calcVersion: 'deal-movement-1.0.0',
    generatedAt: '2026-11-17T23:31:00.000Z',
    openTotal: 9012,
    evaluated: 9000,
    baseline: false,
    firstSeen: 4,
    byStatus: counts,
    changes: [change(0), change(1)],
    changesTotal: 2,
    warnings: [],
    ...over,
});

/** На экран не попадают коды статусов, фаз и режимов. */
const CODES = /rolled_back|at_risk|moving|stuck|dry-run|count|nightly|admin|evaluated|history/;

describe('счёт словами', () => {
    it('статусы — подписями в порядке от спокойных к тревожным', () => {
        const text = dealMovementCountsText(counts);
        expect(text).toBe(
            'Движется — 7000 · Застряла — 1500 · Откатилась — 12 · Под риском — 500',
        );
        expect(text).not.toMatch(CODES);
    });

    it('заголовок снимка: день, открыто и оценено', () => {
        expect(dealMovementDayLabel('2026-11-18')).toBe('18.11.2026');
        expect(dealMovementDayLabel('не дата')).toBe('не дата');
        expect(dealMovementSnapshotHeadline(snapshot())).toBe(
            'Счёт за 18.11.2026: открытых сделок 9012, оценено 9000',
        );
        expect(dealMovementRunTotalsText(run())).toBe(
            'Итог: открытых сделок 9012, оценено 9012',
        );
    });

    it('смены и впервые увиденные; у точки отсчёта смены не считались', () => {
        expect(
            dealMovementChangesLine({ baseline: false, firstSeen: 4, changed: 123 }),
        ).toBe('Сменили статус: 123, впервые увидели: 4');
        expect(
            dealMovementChangesLine({ baseline: true, firstSeen: 9012, changed: 0 }),
        ).toBe('Смены статуса не считались, впервые увидели сделок: 9012');
    });
});

describe('смены статуса', () => {
    it('было → стало, причины и сумма — словами', () => {
        const view = dealMovementChangeView(change(0));
        expect(view.transition).toBe('Движется → Под риском');
        expect(view.reasons).toBe('договорились на 10.11 — контакта после этого не было');
        expect(view.amount?.replace(/\s/g, ' ')).toBe('150 000 ₽');
        expect(dealMovementChangeView(change(1)).amount).toBeNull();
        expect(`${view.transition} ${view.reasons}`).not.toMatch(CODES);
    });

    it('показываются первые тридцать, остаток — «и ещё N», в том числе не пришедший в снимке', () => {
        const many = Array.from({ length: 40 }, (_, index) => change(index));
        const { shown, more } = dealMovementShownChanges(
            snapshot({ changes: many, changesTotal: 1200 }),
        );
        expect(shown).toHaveLength(30);
        expect(more).toBe(1170);
        expect(dealMovementMoreText(more)).toBe('и ещё 1170');
        expect(dealMovementMoreText(dealMovementShownChanges(snapshot()).more)).toBeNull();
    });
});

describe('ход прогона', () => {
    it('идёт — фаза словами; закончен; не удался — с текстом ошибки', () => {
        const going = run({ finished: false, phase: 'history' });
        expect(isDealMovementRunning(going, NOW)).toBe(true);
        expect(dealMovementPhaseText(going, NOW)).toBe('Идёт: читает историю стадий');
        expect(dealMovementPhaseText(run(), NOW)).toBe('Закончен');
        expect(
            dealMovementPhaseText(
                run({ phase: 'failed', error: 'Битрикс недоступен' }),
                NOW,
            ),
        ).toBe('Не удался: Битрикс недоступен');
    });

    it('давно не обновлялся и не закончен — оборвался, а не «идёт»', () => {
        const stale = run({
            finished: false,
            phase: 'deals',
            updatedAt: '2026-11-18T04:00:00.000Z',
        });
        expect(isDealMovementRunning(stale, NOW)).toBe(false);
        expect(dealMovementPhaseText(stale, NOW)).toBe(
            'Оборвался без итога — запустите ещё раз',
        );
        expect(isDealMovementRunning(null, NOW)).toBe(false);
    });

    it('заголовок: режим и кто поставил — подписями', () => {
        const headline = dealMovementRunHeadline(run({ mode: 'dry-run', requestedBy: 'admin' }));
        expect(headline.startsWith('Подсчёт без сохранения, из админки, ')).toBe(true);
        expect(headline).not.toMatch(CODES);
        expect(dealMovementRunHeadline(run({ requestedBy: 'неизвестно' }))).toMatch(
            /^Счёт с сохранением, \d/,
        );
    });

    it('ожидание нажатого прогона кончается на новом законченном прогоне', () => {
        const before = '2026-11-18T07:00:00.000Z';
        expect(isAwaitedDealMovementDone(run({ updatedAt: before }), before)).toBe(false);
        expect(isAwaitedDealMovementDone(run(), before)).toBe(true);
        expect(isAwaitedDealMovementDone(run({ finished: false }), before)).toBe(false);
        expect(isAwaitedDealMovementDone(null, null)).toBe(false);
    });
});

describe('итог нажатия', () => {
    it('подсчёт и счёт поставлены; отказ — с причиной', () => {
        const base = { domain: 'g.bitrix24.ru', jobId: 'g:deal-movement:run', reason: null };
        expect(dealMovementOutcome({ ...base, dryRun: true, dispatched: true }).text).toContain(
            'Подсчёт поставлен',
        );
        const counted = dealMovementOutcome({ ...base, dryRun: false, dispatched: true });
        expect(counted.ok).toBe(true);
        expect(counted.next).toContain('повторно не считается');
        expect(
            dealMovementOutcome({
                ...base,
                dryRun: false,
                dispatched: false,
                reason: 'прогон уже идёт',
            }),
        ).toMatchObject({ ok: false, text: 'Не запущено: прогон уже идёт' });
    });
});
