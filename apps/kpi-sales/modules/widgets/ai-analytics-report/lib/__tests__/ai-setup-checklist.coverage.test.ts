import { describe, expect, it } from 'vitest';
import { AI_CHECKLIST_TEXT } from '../ai-setup-checklist.texts';
import {
    AI_NOT_ANALYZED_REASON,
    aiNotAnalyzedReason,
    aiPilotIds,
} from '../ai-setup-checklist.coverage';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_STATUS,
} from '../ai-setup-checklist.types';
import {
    callReport,
    itemOf,
    passportRow,
    readiness,
    readyOverview,
    settings,
} from './ai-setup-checklist.fixtures';

const T = AI_CHECKLIST_TEXT;

/** Строка «звонки в CRM есть, телефония пуста». */
const silentRow = (managerId: string, departmentId: number | null = 10) =>
    passportRow({
        managerId,
        departmentId,
        callsTotal: 0,
        analyzedCalls: 0,
        discipline: {
            callPlan: 40,
            callDone: 12,
            presentationPlan: 0,
            presentationDone: 0,
        },
    });

describe('доступ к обзору (access)', () => {
    it('403 self_view → data: «Вы видите витрину как менеджер» + обе подсказки', () => {
        const access = itemOf(AI_CHECKLIST_ITEM.ACCESS, {
            overview: null,
            overviewError:
                'Витрина AI-аналитики доступна руководителям (ai_analytics_self_view_enabled)',
        });
        expect(access?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(access?.group).toBe(AI_CHECKLIST_GROUP.DATA);
        expect(access?.title).toBe(T.access.title);
        const texts = access?.actions.map(action =>
            action.kind === AI_CHECKLIST_ACTION.TEXT ? action.text : '',
        );
        expect(texts?.join(' ')).toContain('видит всю структуру');
        expect(texts?.join(' ')).toContain('Сотруднику April');
        expect(texts?.join(' ')).not.toMatch(/BX_|403|админ/);
    });

    it('обзор пришёл — готово; не 403 (сеть) — пункта нет', () => {
        expect(itemOf(AI_CHECKLIST_ITEM.ACCESS)?.status).toBe(
            AI_CHECKLIST_STATUS.DONE,
        );
        expect(
            itemOf(AI_CHECKLIST_ITEM.ACCESS, {
                overview: null,
                overviewError: 'Network Error',
            }),
        ).toBeUndefined();
    });
});

describe('разбор звонков и пилот', () => {
    it('callReport.enabled = false → data-блокер «Разбор звонков выключен»', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.CALL_COVERAGE, {
            settings: settings({ callReport: callReport({ enabled: false }) }),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.title).toBe(T.coverage.offTitle);
        expect(item?.optional).toBe(false);
    });

    it('поля callReport нет — статус unknown, а не «выключено»', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.CALL_COVERAGE, {
            settings: settings({ callReport: undefined }),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.UNKNOWN);
    });

    it('пилот: число и имена, честно — у остальных оценок не будет', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.PILOT, {
            settings: settings({
                callReport: callReport({ pilotUserIds: ['7', '9', '11'] }),
            }),
        });
        expect(item?.title).toBe('Пилот: разбираются звонки 3 сотрудников');
        expect(item?.detail).toBe(
            'В разборе: Менеджер 7, Менеджер 9, Менеджер 11. У остальных менеджеров оценок не будет, пока пилот не расширят.',
        );
        expect(item?.optional).toBe(true);
        expect(item?.actions[0]).toEqual({
            kind: AI_CHECKLIST_ACTION.TEXT,
            text: T.pilot.widen,
        });
    });

    it('пилот из одного сотрудника — «1 сотрудника»; null или выключено — пункта нет', () => {
        expect(
            itemOf(AI_CHECKLIST_ITEM.PILOT, {
                settings: settings({
                    callReport: callReport({ pilotUserIds: ['7'] }),
                }),
            })?.title,
        ).toBe('Пилот: разбираются звонки 1 сотрудника');
        expect(itemOf(AI_CHECKLIST_ITEM.PILOT)).toBeUndefined();
        expect(
            aiPilotIds(callReport({ enabled: false, pilotUserIds: ['7'] })),
        ).toEqual([]);
    });
});

describe('менеджеры вне разбора (not-analyzed)', () => {
    it('CRM-звонки есть, телефония пуста → поимённо с вероятной причиной', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.NOT_ANALYZED, {
            overview: readyOverview([
                passportRow(),
                silentRow('3'),
                silentRow('5', null),
            ]),
            settings: settings({
                callReport: callReport({ pilotUserIds: ['7', '5'] }),
            }),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.title).toBe('Звонки 2 менеджеров не попадают в разбор');
        expect(item?.detail).toContain('вероятная причина');
        expect(item?.detail).toContain('Менеджер 3 (вне пилота)');
        expect(item?.detail).toContain('Менеджер 5 (вне отдела продаж)');
        expect(item?.actions).toHaveLength(2);
        // Есть причина кроме пилота — блокер.
        expect(item?.optional).toBe(false);
    });

    it('все вне разбора только из-за пилота — по желанию (решение по стоимости)', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.NOT_ANALYZED, {
            overview: readyOverview([silentRow('3'), silentRow('5')]),
            settings: settings({
                callReport: callReport({ pilotUserIds: ['7'] }),
            }),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.optional).toBe(true);
        expect(item?.actions).toEqual([
            { kind: AI_CHECKLIST_ACTION.TEXT, text: T.pilot.widen },
        ]);
    });

    it('без звонков в CRM — не сигнал; обзора нет — unknown', () => {
        expect(itemOf(AI_CHECKLIST_ITEM.NOT_ANALYZED)?.status).toBe(
            AI_CHECKLIST_STATUS.DONE,
        );
        expect(
            itemOf(AI_CHECKLIST_ITEM.NOT_ANALYZED, { overview: null })?.status,
        ).toBe(AI_CHECKLIST_STATUS.UNKNOWN);
    });

    it('aiNotAnalyzedReason: пилот → вне ОП → порог → иное', () => {
        const row = { managerId: '3', departmentId: 10 };
        expect(
            aiNotAnalyzedReason(row, callReport({ pilotUserIds: ['7'] })),
        ).toBe(AI_NOT_ANALYZED_REASON.OUT_OF_PILOT);
        expect(
            aiNotAnalyzedReason({ ...row, departmentId: null }, callReport()),
        ).toBe(AI_NOT_ANALYZED_REASON.OUT_OF_SALES);
        expect(
            aiNotAnalyzedReason(
                { ...row, departmentId: null },
                callReport({ salesOnly: false, minDurationSec: 30 }),
            ),
        ).toBe(AI_NOT_ANALYZED_REASON.SHORT);
        expect(aiNotAnalyzedReason(row, callReport())).toBe(
            AI_NOT_ANALYZED_REASON.OTHER,
        );
    });

    it('порог длительности в подписи: «звонки короче 30 сек»', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.NOT_ANALYZED, {
            overview: readyOverview([silentRow('3')]),
            settings: settings({
                callReport: callReport({ minDurationSec: 30 }),
            }),
        });
        expect(item?.detail).toContain('Менеджер 3 (звонки короче 30 сек)');
    });
});

describe('пустое окно конвейера и качество данных', () => {
    it('kpi-only при включённом разборе → «За 30 дней нет ни одного разбора»', () => {
        const input = {
            settings: settings({
                readiness: readiness({
                    mode: 'kpi-only',
                    reasons: ['no-analysis-in-pipeline-window'],
                }),
            }),
        };
        expect(itemOf(AI_CHECKLIST_ITEM.PIPELINE, input)?.title).toBe(
            T.pipeline.title,
        );
        // Обзор в kpi-only не запрашивается — «проверим, когда появятся разборы».
        const tenure = itemOf(AI_CHECKLIST_ITEM.TENURE, {
            ...input,
            overview: null,
        });
        expect(tenure?.status).toBe(AI_CHECKLIST_STATUS.UNKNOWN);
        expect(tenure?.detail).toBe(T.unknown.kpiOnly);
    });

    it('разбор выключен — пустое окно не дублируем', () => {
        expect(
            itemOf(AI_CHECKLIST_ITEM.PIPELINE, {
                settings: settings({
                    callReport: callReport({ enabled: false }),
                    readiness: readiness({
                        mode: 'kpi-only',
                        reasons: ['no-analysis-in-pipeline-window'],
                    }),
                }),
            }),
        ).toBeUndefined();
    });

    it('data-quality-timestamp-leak → data-блокер', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.DATA_QUALITY, {
            settings: settings({
                readiness: readiness({
                    reasons: ['data-quality-timestamp-leak'],
                }),
            }),
        });
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.DATA);
        expect(item?.optional).toBe(false);
    });
});
