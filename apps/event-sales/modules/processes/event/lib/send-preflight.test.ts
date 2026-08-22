import { describe, expect, it } from 'vitest';
import type { RootState } from '@/modules/app/model/store';
import { hasIncompleteLeadMarks } from './send-preflight';

/** Минимальный срез состояния — только то, что читает проверка пометок. */
const makeState = (over: {
    workStatus: string;
    leadId?: number;
    taskLeads?: string[];
    marks?: Record<
        number,
        { siteStatusCode: string | null; notCaTypeCode: string | null }
    >;
    marksStatus?: string;
}): RootState =>
    ({
        eventReport: {
            report: {
                workStatus: { current: { code: over.workStatus } },
            },
        },
        app: { bitrix: { lead: over.leadId ? { ID: over.leadId } : null } },
        eventTask: {
            current: over.taskLeads ? { ufCrmTask: over.taskLeads } : null,
        },
        leadMarks: {
            status: over.marksStatus ?? 'ready',
            byId: Object.fromEntries(
                Object.entries(over.marks ?? {}).map(([id, mark]) => [
                    id,
                    {
                        id: Number(id),
                        title: '',
                        statusId: null,
                        saleDealId: null,
                        ...mark,
                    },
                ]),
            ),
        },
    }) as unknown as RootState;

describe('hasIncompleteLeadMarks', () => {
    it('не финальный статус — пометки не требуются', () => {
        expect(
            hasIncompleteLeadMarks(
                makeState({ workStatus: 'inJob', leadId: 5 }),
            ),
        ).toBe(false);
    });

    it('продажа с незакрытой заявкой — стоп', () => {
        expect(
            hasIncompleteLeadMarks(
                makeState({
                    workStatus: 'success',
                    leadId: 5,
                    marks: { 5: { siteStatusCode: null, notCaTypeCode: null } },
                }),
            ),
        ).toBe(true);
    });

    it('«не ЦА» без типа — не закрыта, с типом — закрыта', () => {
        const notCa = (notCaTypeCode: string | null) =>
            makeState({
                workStatus: 'fail',
                leadId: 5,
                marks: {
                    5: {
                        siteStatusCode: 'op_lead_site_status3',
                        notCaTypeCode,
                    },
                },
            });
        expect(hasIncompleteLeadMarks(notCa(null))).toBe(true);
        expect(hasIncompleteLeadMarks(notCa('op_lead_not_ca_type1'))).toBe(
            false,
        );
    });

    it('пометки ещё не загружены — считаем незакрытыми (окно их подтянет)', () => {
        expect(
            hasIncompleteLeadMarks(
                makeState({ workStatus: 'fail', taskLeads: ['L_7'] }),
            ),
        ).toBe(true);
    });

    it('ошибка загрузки пометок НЕ блокирует отправку', () => {
        expect(
            hasIncompleteLeadMarks(
                makeState({
                    workStatus: 'fail',
                    leadId: 5,
                    marksStatus: 'error',
                }),
            ),
        ).toBe(false);
    });

    it('лидов у дела нет — требовать нечего', () => {
        expect(
            hasIncompleteLeadMarks(makeState({ workStatus: 'success' })),
        ).toBe(false);
    });
});
