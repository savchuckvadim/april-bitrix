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
        company: { color: { isChanged: false } },
        app: {
            config: { withPostFail: false, withColorRequired: false },
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
