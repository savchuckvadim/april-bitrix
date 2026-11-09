import { describe, expect, it } from 'vitest';
import { webhookErrorView } from './webhook-error';

const NOW = new Date('2026-11-09T12:00:00Z');

describe('последняя ошибка вебхука Telegram', () => {
    it('старше часа и очередь пуста — неактуальна, с датой', () => {
        const view = webhookErrorView('2026-11-09T09:00:00Z', 0, NOW);
        expect(view.stale).toBe(true);
        expect(view.at).toMatch(/09\.11/);
    });

    it('свежая — актуальна', () => {
        expect(webhookErrorView('2026-11-09T11:50:00Z', 0, NOW).stale).toBe(false);
    });

    it('давно, но в очереди сообщения — актуальна', () => {
        expect(webhookErrorView('2026-11-09T09:00:00Z', 3, NOW).stale).toBe(false);
    });

    it('без даты — как раньше, актуальна', () => {
        expect(webhookErrorView(null, 0, NOW)).toEqual({ at: null, stale: false });
    });
});
