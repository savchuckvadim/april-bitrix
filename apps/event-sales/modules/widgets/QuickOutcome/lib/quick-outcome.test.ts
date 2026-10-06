import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    QUICK_OUTCOME,
    QUICK_OUTCOME_WORK_STATUS,
    buildQuickOutcomeSender,
    getOutcomeOwnerNote,
    getQuickOutcomeButtons,
    resolveOutcomeOwnerId,
} from './quick-outcome';

const me = { ID: 11, NAME: 'Надежда', LAST_NAME: 'Карнаухова' } as BXUser;

describe('QUICK_OUTCOME_WORK_STATUS', () => {
    it('продажа уезжает статусом «Продажа», отказ — «Отказ»', () => {
        expect(QUICK_OUTCOME_WORK_STATUS[QUICK_OUTCOME.sale]).toBe('success');
        expect(QUICK_OUTCOME_WORK_STATUS[QUICK_OUTCOME.fail]).toBe('fail');
    });
});

describe('resolveOutcomeOwnerId', () => {
    it('итог записывается на ответственного сделки, а не на нажавшего', () => {
        expect(
            resolveOutcomeOwnerId({ dealAssignedById: 369, myId: 11 }),
        ).toBe(369);
    });

    it('портал отдаёт id строкой — понимаем и её', () => {
        expect(
            resolveOutcomeOwnerId({ dealAssignedById: '369', myId: 11 }),
        ).toBe(369);
    });

    it.each([undefined, null, '', 0, '0', 'abc', -5])(
        'сделки нет или ответственный не указан (%s) — на самого пользователя',
        dealAssignedById => {
            expect(resolveOutcomeOwnerId({ dealAssignedById, myId: 11 })).toBe(
                11,
            );
        },
    );
});

describe('buildQuickOutcomeSender', () => {
    it('итог за другого — пометка «кто отправил»', () => {
        expect(
            buildQuickOutcomeSender({ isActive: true, me, ownerId: 369 }),
        ).toEqual({ ID: 11, NAME: 'Карнаухова Надежда' });
    });

    it('итог за самого себя пометки не несёт', () => {
        expect(
            buildQuickOutcomeSender({ isActive: true, me, ownerId: 11 }),
        ).toBeUndefined();
    });

    it('быстрого итога нет — пометки нет, даже если ответственный другой', () => {
        expect(
            buildQuickOutcomeSender({ isActive: false, me, ownerId: 369 }),
        ).toBeUndefined();
    });

    it('пользователь или ответственный неизвестны — пометки нет', () => {
        expect(
            buildQuickOutcomeSender({ isActive: true, me: null, ownerId: 369 }),
        ).toBeUndefined();
        expect(
            buildQuickOutcomeSender({ isActive: true, me, ownerId: 0 }),
        ).toBeUndefined();
    });
});

describe('getOutcomeOwnerNote', () => {
    it('называет ответственного по имени', () => {
        expect(getOutcomeOwnerNote(' Мережкина Елена ')).toBe(
            'Запишется на ответственного сделки — Мережкина Елена. ' +
                'В истории будет видно, что отчёт отправили вы.',
        );
    });

    it('имя неизвестно — говорит без него, номер сотрудника не показывает', () => {
        const note = getOutcomeOwnerNote('');
        expect(note).toBe(
            'Запишется на ответственного сделки. ' +
                'В истории будет видно, что отчёт отправили вы.',
        );
        expect(note).not.toMatch(/\d/);
    });
});

describe('getQuickOutcomeButtons', () => {
    const base = {
        isItemScreen: false,
        hasClient: true,
        canSell: true,
        isTmc: false,
    };

    it('есть сделка или компания, режим отдела продаж — «продажа» и «отказ»', () => {
        expect(getQuickOutcomeButtons(base)).toEqual([
            QUICK_OUTCOME.sale,
            QUICK_OUTCOME.fail,
        ]);
    });

    it('нет ни сделки, ни компании (чистый лид) — только «отказ»', () => {
        expect(getQuickOutcomeButtons({ ...base, canSell: false })).toEqual([
            QUICK_OUTCOME.fail,
        ]);
    });

    it('у ТМЦ статуса «Продажа» нет — только «отказ»', () => {
        expect(getQuickOutcomeButtons({ ...base, isTmc: true })).toEqual([
            QUICK_OUTCOME.fail,
        ]);
    });

    it('на экране дела кнопок нет: итог ставится в форме', () => {
        expect(getQuickOutcomeButtons({ ...base, isItemScreen: true })).toEqual(
            [],
        );
    });

    it('клиента нет — записывать итог некому', () => {
        expect(getQuickOutcomeButtons({ ...base, hasClient: false })).toEqual(
            [],
        );
    });
});
