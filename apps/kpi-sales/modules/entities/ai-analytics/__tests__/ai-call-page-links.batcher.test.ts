import { describe, expect, it, vi } from 'vitest';
import {
    CALL_PAGE_LINKS_BATCH,
    createCallPageLinkBatcher,
    type CallPageLinksLoader,
} from '../lib/ai-call-page-links.batcher';

/** Планировщик под управлением теста: накопленное уходит по команде. */
const manualSchedule = () => {
    const flushes: (() => void)[] = [];
    return {
        schedule: (flush: () => void) => {
            flushes.push(flush);
        },
        run: () => {
            for (const flush of flushes.splice(0)) flush();
        },
        pending: () => flushes.length,
    };
};

const urlOf = (id: string): string => `https://site/call/token-${id}`;

/** Бэкенд отдаёт ссылки на всё, кроме перечисленных номеров. */
const loaderWithout = (denied: string[] = []) =>
    vi.fn<CallPageLinksLoader>((ids) =>
        Promise.resolve(
            ids
                .filter((id) => !denied.includes(id))
                .map((id) => ({ transcriptionId: id, url: urlOf(id) })),
        ),
    );

describe('createCallPageLinkBatcher', () => {
    it('ссылки строк одного списка уходят одним запросом', async () => {
        const load = loaderWithout();
        const timer = manualSchedule();
        const batcher = createCallPageLinkBatcher(load, timer.schedule);

        const first = batcher.get('10245');
        const second = batcher.get('10301');
        expect(timer.pending()).toBe(1);
        timer.run();

        await expect(first).resolves.toBe(urlOf('10245'));
        await expect(second).resolves.toBe(urlOf('10301'));
        expect(load).toHaveBeenCalledTimes(1);
        expect(load).toHaveBeenCalledWith(['10245', '10301']);
    });

    it('повторный вопрос о том же звонке в сеть не идёт — и когда ссылки нет', async () => {
        const load = loaderWithout(['10302']);
        const timer = manualSchedule();
        const batcher = createCallPageLinkBatcher(load, timer.schedule);

        const allowed = batcher.get('10245');
        const denied = batcher.get('10302');
        // Та же строка отрисовалась второй раз до ответа.
        const again = batcher.get('10245');
        timer.run();
        await expect(allowed).resolves.toBe(urlOf('10245'));
        await expect(again).resolves.toBe(urlOf('10245'));
        await expect(denied).resolves.toBeNull();

        await expect(batcher.get('10245')).resolves.toBe(urlOf('10245'));
        await expect(batcher.get('10302')).resolves.toBeNull();
        expect(timer.pending()).toBe(0);
        expect(load).toHaveBeenCalledTimes(1);
        expect(load).toHaveBeenCalledWith(['10245', '10302']);
    });

    it('длинный список режется на пачки по пределу ручки', async () => {
        const load = loaderWithout();
        const timer = manualSchedule();
        const batcher = createCallPageLinkBatcher(load, timer.schedule);
        const ids = Array.from({ length: CALL_PAGE_LINKS_BATCH + 5 }, (_, i) =>
            String(20000 + i),
        );

        const all = ids.map((id) => batcher.get(id));
        timer.run();
        await Promise.all(all);

        expect(load).toHaveBeenCalledTimes(2);
        expect(load.mock.calls[0]?.[0]).toHaveLength(CALL_PAGE_LINKS_BATCH);
        expect(load.mock.calls[1]?.[0]).toHaveLength(5);
    });

    it('сбой запроса: строки остаются без ссылки, следующий показ спрашивает заново', async () => {
        const load = vi
            .fn<CallPageLinksLoader>()
            .mockRejectedValueOnce(new Error('сеть'))
            .mockResolvedValueOnce([
                { transcriptionId: '10245', url: urlOf('10245') },
            ]);
        const timer = manualSchedule();
        const batcher = createCallPageLinkBatcher(load, timer.schedule);

        const failed = batcher.get('10245');
        timer.run();
        await expect(failed).resolves.toBeNull();

        const retried = batcher.get('10245');
        timer.run();
        await expect(retried).resolves.toBe(urlOf('10245'));
        expect(load).toHaveBeenCalledTimes(2);
    });
});
