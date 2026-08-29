import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AppGetState } from '@/modules/app/model/store';
import type { QuestionnaireCatalogStatus } from '../model/QuestionnaireCatalogSlice';
import { waitForQuestionnaireCatalog } from './questionnaire-wait';

/**
 * Поллер каталога: ждём только `loading` и только до дедлайна.
 *
 * Смысл проверок — не «дождались», а «отпустили»: каталог не имеет права
 * задерживать отправку отчёта дольше полутора секунд, чем бы он ни болел.
 */

const stateOf = (statuses: QuestionnaireCatalogStatus[]): AppGetState => {
    let call = 0;
    return (() => {
        const status =
            statuses[Math.min(call++, statuses.length - 1)] ?? 'ready';
        return { questionnaireCatalog: { status } };
    }) as unknown as AppGetState;
};

afterEach(() => {
    vi.useRealTimers();
});

describe('ожидание каталога анкет', () => {
    it('укладывается в дедлайн и отпускает, даже если каталог всё ещё грузится', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        let settledAt = 0;

        const waiting = waitForQuestionnaireCatalog(stateOf(['loading'])).then(
            () => {
                settledAt = Date.now();
            },
        );

        await vi.advanceTimersByTimeAsync(1000);
        expect(settledAt).toBe(0);

        await vi.advanceTimersByTimeAsync(600);
        await waiting;

        expect(settledAt - started).toBeGreaterThanOrEqual(1500);
        expect(settledAt - started).toBeLessThanOrEqual(1600);
    });

    it('дождавшись ответа, возвращается сразу', async () => {
        vi.useFakeTimers();
        const started = Date.now();
        // Момент снимается ВНУТРИ промиса: часы теста уедут дальше сами.
        let settledAt = 0;

        const waiting = waitForQuestionnaireCatalog(
            stateOf(['loading', 'loading', 'ready']),
        ).then(() => {
            settledAt = Date.now();
        });
        await vi.advanceTimersByTimeAsync(1000);
        await waiting;

        expect(settledAt - started).toBeLessThanOrEqual(150);
    });

    it('не ждёт вовсе, если запрос не начинали или он уже провалился', async () => {
        vi.useFakeTimers();
        const started = Date.now();

        await waitForQuestionnaireCatalog(stateOf(['idle']));
        await waitForQuestionnaireCatalog(stateOf(['error']));

        // Ни одного тика таймера: fallback-состояние уже settled.
        expect(Date.now() - started).toBe(0);
    });
});
