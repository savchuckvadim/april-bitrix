import { describe, expect, it } from 'vitest';
import type { BXUser } from '@workspace/bx';
import {
    QUICK_OUTCOME,
    QUICK_OUTCOME_WORK_STATUS,
    buildQuickOutcomeSender,
    getOutcomeOwnerNote,
    SALE_NEEDS_COMPANY_HINT,
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
        context: 'company' as const,
        isTmc: false,
    };
    const sale = { kind: QUICK_OUTCOME.sale };
    const fail = { kind: QUICK_OUTCOME.fail };

    it('компания в режиме отдела продаж — «продажа» и «отказ»', () => {
        expect(getQuickOutcomeButtons(base)).toEqual([sale, fail]);
    });

    it('сделка без компании — «продажа» серая с подсказкой, «отказ» как есть', () => {
        expect(
            getQuickOutcomeButtons({ ...base, context: 'dealNoCompany' }),
        ).toEqual([
            { kind: QUICK_OUTCOME.sale, blockedHint: SALE_NEEDS_COMPANY_HINT },
            fail,
        ]);
        expect(SALE_NEEDS_COMPANY_HINT).toBe('Добавьте компанию в сделку');
    });

    it('лид — только «отказ»', () => {
        expect(getQuickOutcomeButtons({ ...base, context: 'lead' })).toEqual([
            fail,
        ]);
    });

    it('у ТМЦ статуса «Продажа» нет — только «отказ»', () => {
        expect(getQuickOutcomeButtons({ ...base, isTmc: true })).toEqual([
            fail,
        ]);
    });

    it('на экране дела кнопок нет: итог ставится в форме', () => {
        expect(getQuickOutcomeButtons({ ...base, isItemScreen: true })).toEqual(
            [],
        );
    });

    it('клиента нет — записывать итог некому', () => {
        expect(getQuickOutcomeButtons({ ...base, context: 'unknown' })).toEqual(
            [],
        );
    });
});
