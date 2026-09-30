import { describe, expect, it } from 'vitest';
import { plain } from './plain-text.test-helper';
import type { ModelPoolSnapshot } from '../model';
import { shortPoolKey, toPoolView } from './pool-view.util';

const SELF = 'self0000000000000000';

const pool = (patch: Partial<ModelPoolSnapshot> = {}): ModelPoolSnapshot => ({
    monthKey: '2026-09',
    generatedAt: '2026-10-01T02:00:00.000Z',
    status: 'estimated',
    reasons: ['season-not-estimated'],
    eligible: 5,
    participants: 4,
    portals: [
        { key: 'bbbb', included: false, reason: 'no-consent' },
        { key: 'aaaa', included: true, reason: 'included' },
        { key: SELF, included: true, reason: 'included' },
        { key: 'cccc', included: false, reason: 'brand-new-reason' },
    ],
    selfKey: SELF,
    selfIncluded: true,
    edges: 6,
    beta: { value: 0.3, ci90: [0.1, 0.5], iSquared: 0.42, portals: 3, label: 'hybrid' },
    betaPortals: 3,
    minPortalsE2: 5,
    evidenceReady: false,
    ...patch,
});

const valueOf = (rows: { label: string; value: string }[], label: string) =>
    plain(rows.find(row => row.label === label)?.value ?? '');

describe('toPoolView: пул порталов', () => {
    it('свой портал, участники, готовность к следующему уровню', () => {
        const view = toPoolView(pool());

        expect(view.status.label).toBe('Пул собран');
        expect(valueOf(view.metrics, 'Этот портал')).toBe('участвует');
        expect(valueOf(view.metrics, 'Участников')).toBe('4 из 5 подходящих');
        expect(valueOf(view.metrics, 'Порталов с оценкой связи качества')).toBe('3 из 5');
        expect(valueOf(view.metrics, 'Следующий уровень доказательности')).toBe('не готов');
        expect(view.reasons[0]?.label).toBe('Сезонность не оценена');
    });

    it('себя нет в вердиктах — так и написано, а не «не участвует»', () => {
        const view = toPoolView(pool({ selfIncluded: null }));

        expect(valueOf(view.metrics, 'Этот портал')).toBe('нет в вердиктах');
    });

    it('оценка пула: интервал, расхождение в процентах, метка по-русски', () => {
        const { beta } = toPoolView(pool());

        expect(valueOf(beta ?? [], 'Оценка связи качества')).toBe('0,30 (0,10 – 0,50)');
        expect(valueOf(beta ?? [], 'Расхождение порталов')).toBe('42 %');
        expect(valueOf(beta ?? [], 'Метка оценки')).toBe('С опорой на справочное значение');
        expect(toPoolView(pool({ beta: null })).beta).toBeNull();
    });

    it('вердикты: свой первым, затем вошедшие; неизвестная причина не роняет', () => {
        const { verdicts } = toPoolView(pool());

        expect(verdicts.map(row => row.key)).toEqual([SELF, 'aaaa', 'bbbb', 'cccc']);
        expect(verdicts[0]?.isSelf).toBe(true);
        expect(verdicts[2]?.reason.label).toBe('Нет согласия');
        expect(verdicts[3]?.reason.known).toBe(false);
    });
});

describe('shortPoolKey', () => {
    it('длинный хэш режется, короткий остаётся', () => {
        expect(shortPoolKey('0123456789abcdef0123')).toBe('0123456789…');
        expect(shortPoolKey('abc')).toBe('abc');
    });
});
