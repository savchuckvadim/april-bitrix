import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { validateSend } from './send-validation';

/**
 * Минимальный срез стейта для validateSend. Дефолт: отчёт «в работе»
 * с комментарием, план активен и пуст — то есть валидация должна
 * требовать тип и название плана.
 */
const makeState = (over?: {
    isPlanActive?: boolean;
    planName?: string;
    planType?: { id: number; code: string; name: string } | null;
    comment?: string;
    workStatus?: string;
    notCaTypeCode?: string | null;
    withPostFail?: boolean;
}): RootState =>
    ({
        eventReport: {
            report: {
                comment: over?.comment ?? 'поговорили',
                workStatus: {
                    current: { code: over?.workStatus ?? 'inJob' },
                },
            },
        },
        eventPlan: {
            isActive: over?.isPlanActive ?? true,
            name: over?.planName ?? '',
            type: { items: [], current: over?.planType ?? null },
        },
        eventItemMenu: { type: 'CURRENT' },
        eventPostFail: { postFailDate: null },
        leadRequest: {
            finalSync: { notCaTypeCode: over?.notCaTypeCode ?? null },
        },
        company: { color: { isChanged: false } },
        app: {
            config: {
                withPostFail: over?.withPostFail ?? false,
                withColorRequired: false,
            },
            bitrix: { company: null },
        },
    }) as unknown as RootState;

describe('validateSend — гейт «Без плана» (isActive)', () => {
    it('план активен и пуст — требуются тип и название', () => {
        const { result } = validateSend(makeState());
        expect(result.errors.type).toBe('Не выбран тип звонка');
        expect(result.errors.name).toBeTruthy();
        expect(result.isError).toBe(true);
    });

    it('«Без плана» (isActive=false) — тип и название не требуются', () => {
        const { result } = validateSend(makeState({ isPlanActive: false }));
        expect(result.errors.type).toBeFalsy();
        expect(result.errors.name).toBeFalsy();
        expect(result.isError).toBe(false);
    });

    it('комментарий обязателен и при «Без плана»', () => {
        const { result } = validateSend(
            makeState({ isPlanActive: false, comment: '' }),
        );
        expect(result.errors.comment).toBe('Напишите комментарий');
    });
});

describe('validateSend — статус «Не ЦА»', () => {
    it('без типа «не ЦА» отправка не проходит', () => {
        const { result } = validateSend(makeState({ workStatus: 'notCa' }));
        expect(result.errors.notCaType).toBe('Выберите тип «не ЦА»');
    });

    it('с типом — ошибки нет, план не требуется (статус финальный)', () => {
        const { result } = validateSend(
            makeState({
                workStatus: 'notCa',
                notCaTypeCode: 'op_lead_not_ca_type1',
            }),
        );
        expect(result.errors.notCaType).toBeFalsy();
        // isNoWork: тип/название плана не требуются даже при активном плане.
        expect(result.errors.type).toBeFalsy();
        expect(result.isError).toBe(false);
    });

    it('дата следующего звонка при «Не ЦА» НЕ требуется даже на withPostFail', () => {
        const { result } = validateSend(
            makeState({
                workStatus: 'notCa',
                notCaTypeCode: 'op_lead_not_ca_type1',
                withPostFail: true,
            }),
        );
        expect(result.errors.postFailDate).toBeFalsy();
    });

    it('обычный отказ на withPostFail всё ещё требует дату', () => {
        const { result } = validateSend(
            makeState({ workStatus: 'fail', withPostFail: true }),
        );
        expect(result.errors.postFailDate).toBeTruthy();
    });
});
