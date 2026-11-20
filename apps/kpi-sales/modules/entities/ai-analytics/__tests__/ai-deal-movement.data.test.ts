import { describe, expect, it } from 'vitest';
import {
    AI_DEAL_MOVEMENT_ALARM_STATUSES,
    AI_DEAL_MOVEMENT_STATUSES,
    isAiDealMovementAlarm,
} from '../lib/ai-deal-movement.data';
import { AI_ENVELOPE_NOT_READY_TEXT, aiReadyData } from '../lib/ai-envelope.util';

describe('ai-deal-movement.data — коды статусов движения сделок', () => {
    it('тревожные — все статусы, кроме «Движется», в том же порядке', () => {
        expect(AI_DEAL_MOVEMENT_ALARM_STATUSES).toEqual(
            AI_DEAL_MOVEMENT_STATUSES.filter(status => status !== 'moving'),
        );
    });

    it('isAiDealMovementAlarm: тревожный код — да, «Движется» и чужое — нет', () => {
        expect(isAiDealMovementAlarm('stuck')).toBe(true);
        expect(isAiDealMovementAlarm('rolled_back')).toBe(true);
        expect(isAiDealMovementAlarm('moving')).toBe(false);
        expect(isAiDealMovementAlarm('nope')).toBe(false);
        expect(isAiDealMovementAlarm(null)).toBe(false);
    });
});

describe('aiReadyData — данные синхронной ручки из конверта', () => {
    it('ready с данными — данные', () => {
        expect(
            aiReadyData({ status: 'ready', requestKey: 'k', data: { n: 1 } }),
        ).toEqual({ n: 1 });
    });

    it('ошибка с текстом сервера — бросает его', () => {
        expect(() =>
            aiReadyData({
                status: 'error',
                requestKey: 'k',
                message: 'Портал не найден',
            }),
        ).toThrow('Портал не найден');
    });

    it('не готово и без текста — запасной текст', () => {
        expect(() =>
            aiReadyData({ status: 'queued', requestKey: 'k' }),
        ).toThrow(AI_ENVELOPE_NOT_READY_TEXT);
        expect(() =>
            aiReadyData({ status: 'ready', requestKey: 'k', message: '  ' }),
        ).toThrow(AI_ENVELOPE_NOT_READY_TEXT);
    });
});
