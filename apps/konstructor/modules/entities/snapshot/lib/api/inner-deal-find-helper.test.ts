import { beforeEach, describe, expect, it, vi } from 'vitest';

const innerDealFind = vi.hoisted(() => vi.fn());

vi.mock('@workspace/nest-konstructor-api', () => ({
    getKonstructorDeal: () => ({ innerDealFind }),
}));

import { findInnerDeal } from './inner-deal-find-helper';

const deferred = () => {
    let resolve!: (value: { found: boolean }) => void;
    const promise = new Promise<{ found: boolean }>(done => {
        resolve = done;
    });
    return { promise, resolve };
};

describe('запись сделки: одинаковые запросы на входе не дублируются', () => {
    // без возврата значения: vitest вызвал бы возвращённый мок как уборку после теста
    beforeEach(() => {
        innerDealFind.mockReset();
    });

    it('пока первый в пути, второй такой же к нему присоединяется', async () => {
        const answer = deferred();
        innerDealFind.mockReturnValue(answer.promise);

        const first = findInnerDeal({ domain: 'd', dealId: 7 });
        const second = findInnerDeal({ domain: 'd', dealId: 7 });
        expect(innerDealFind).toHaveBeenCalledTimes(1);

        answer.resolve({ found: true });
        expect(await first).toBe(await second);
    });

    it('после ответа следующий запрос идёт на сервер — ответ не запоминается', async () => {
        innerDealFind.mockResolvedValue({ found: true });
        await findInnerDeal({ domain: 'd', dealId: 7 });
        await findInnerDeal({ domain: 'd', dealId: 7 });
        expect(innerDealFind).toHaveBeenCalledTimes(2);
    });

    it('другая сделка или сервисный смарт — свой запрос', () => {
        innerDealFind.mockReturnValue(deferred().promise);
        // свои номера сделок: незавершённые запросы этого теста не должны встретиться следующему
        void findInnerDeal({ domain: 'd', dealId: 31 });
        void findInnerDeal({ domain: 'd', dealId: 32 });
        void findInnerDeal({ domain: 'd', dealId: 31, serviceSmartId: 3 });
        expect(innerDealFind).toHaveBeenCalledTimes(3);
    });

    it('упавший запрос не застревает: следующий пробует снова', async () => {
        innerDealFind.mockRejectedValueOnce(new Error('сеть'));
        await expect(findInnerDeal({ domain: 'd', dealId: 41 })).rejects.toThrow('сеть');
        innerDealFind.mockResolvedValue({ found: false });
        await expect(findInnerDeal({ domain: 'd', dealId: 41 })).resolves.toEqual({ found: false });
    });
});
