import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { EventReportContext } from '../services/context/event-report.context';
import { EventReportKpiPayloadBuilder } from '../services/kpi-list/event-report-kpi-payload.builder';
import { DealFlowResult } from '../services/deal/event-report-deal-flow.service';
import { buildEventHistoryParts } from '../services/history/event-history-comment.builder';
import { buildEventTaskDescription } from '../services/task/event-task-description.builder';
import {
    ActingManagerMark,
    actingManagerNote,
    userProfileUrl,
} from '../services/acting-manager/acting-manager.mark';
import { actingManagerFromDto } from '../services/acting-manager/acting-manager-from-dto';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * РЕЖИМ РУКОВОДИТЕЛЯ в браузерном пути отчёта: пометка «кто отчитался за
 * сотрудника» и правило «финал — на ответственного сделки» обязаны
 * совпадать с серверными. Таймлайна и уведомления здесь нет: их пишет
 * сервер досылкой.
 */
const NOW = new Date('2026-09-28T09:00:00.000Z');
const DOMAIN = 'example.bitrix24.ru';

const HEAD: ActingManagerMark = {
    id: 481,
    name: 'Иванов Иван',
    isConfirmedHead: true,
};

const makePortal = () => ({
    getTimezone: () => 'Europe/Moscow',
    getEntityFieldByCode: () => null,
});

const makeCtx = (
    mark: ActingManagerMark | null,
    workStatus = 'inJob',
    planResponsibleId = 231,
) => {
    const ctx = new EventReportContext(
        {
            domain: DOMAIN,
            currentTask: { eventType: 'warm', name: 'Уточнить бюджет' },
            report: {
                resultStatus: 'result',
                description: 'Договорились о встрече',
                workStatus: { current: { code: workStatus } },
                failType: { current: { code: 'failure', name: 'Отказ' } },
                failReason: { current: { code: 'nomoney', name: 'Нет денег' } },
            },
            plan: {
                responsibility: { ID: planResponsibleId },
                createdBy: { ID: 481 },
            },
        } as never,
        makePortal() as never,
        {
            entityType: 'company',
            entityId: 431,
            company: { ID: '431', TITLE: 'ООО Ромашка' },
            lead: null,
            currentBaseDeal: { ID: '5512', ASSIGNED_BY_ID: '387' },
            currentPresDeal: null,
        } as never,
        NOW,
    );
    ctx.setActingManager(mark);
    return ctx;
};

const deals: DealFlowResult = {
    baseDealId: '5512',
    newPlanPresDealId: null,
    newUnplannedPresDealId: null,
};

const build = (ctx: EventReportContext) =>
    new EventReportKpiPayloadBuilder(
        makePortal() as never,
        ctx,
        deals,
    ).buildAll();

describe('пометка из отчёта', () => {
    const dto = (over: Record<string, unknown> = {}) =>
        ({
            domain: DOMAIN,
            plan: { responsibility: { ID: 231 } },
            actingManager: { ID: 481, NAME: ' Иванов Иван ' },
            ...over,
        }) as never;

    it('отчёт за сотрудника — пометка с именем руководителя', () => {
        expect(actingManagerFromDto(dto())).toEqual({
            id: 481,
            name: 'Иванов Иван',
            isConfirmedHead: true,
        });
    });

    it('поля нет — обычный отчёт', () => {
        expect(
            actingManagerFromDto(dto({ actingManager: undefined })),
        ).toBeNull();
    });

    it('отчёт за самого себя режимом руководителя не считается', () => {
        expect(
            actingManagerFromDto(
                dto({ plan: { responsibility: { ID: 481 } } }),
            ),
        ).toBeNull();
    });

    it('мусорный идентификатор — обычный отчёт', () => {
        expect(
            actingManagerFromDto(dto({ actingManager: { ID: 'abc' } })),
        ).toBeNull();
    });
});

describe('пометка в истории, задаче и KPI', () => {
    it('обычный отчёт — пометки нет нигде', () => {
        const ctx = makeCtx(null);
        expect(ctx.actingManagerNote).toBe('');
        expect(buildEventHistoryParts(ctx).join('|')).not.toContain(
            'Отчитался руководитель',
        );
        for (const payload of build(ctx)) {
            expect(String(payload.values.manager_comment)).not.toContain(
                'Отчитался руководитель',
            );
        }
    });

    it('комментарий менеджера пометкой НЕ подменяется', () => {
        const ctx = makeCtx(HEAD);
        expect(ctx.reportComment).toBe('Договорились о встрече');
        expect(ctx.actingManagerNote).toBe(actingManagerNote(HEAD));
    });

    it('история: пометка идёт сразу за «что сделано»', () => {
        const parts = buildEventHistoryParts(makeCtx(HEAD));
        expect(parts[0]).toContain('Договорились о встрече');
        expect(parts[1]).toBe('Отчитался руководитель: Иванов Иван');
    });

    it('описание задачи: блок со ссылкой на профиль', () => {
        const description = buildEventTaskDescription({
            domain: DOMAIN,
            company: { ID: '431', TITLE: 'ООО Ромашка' } as never,
            lead: null,
            contacts: [],
            baseDeal: { id: 5512, title: 'Продажа' },
            comment: 'Договорились о встрече',
            actingManager: {
                label: 'Отчитался руководитель',
                name: 'Иванов Иван',
                profileUrl: userProfileUrl(DOMAIN, 481),
            },
        });
        expect(description).toContain(
            '[URL=https://example.bitrix24.ru/company/personal/user/481/]Иванов Иван[/URL]',
        );
    });

    it('KPI: комментарий несёт пометку, запись остаётся сотруднику', () => {
        const payloads = build(makeCtx(HEAD));
        expect(payloads.length).toBeGreaterThan(0);
        for (const payload of payloads) {
            expect(payload.values.responsible).toBe(231);
            expect(String(payload.values.manager_comment)).toContain(
                'Иванов Иван',
            );
        }
    });
});

describe('финал — на ответственного сделки', () => {
    it('отказ засчитывается ответственному сделки, а не нажавшему', () => {
        const ctx = makeCtx(null, 'fail', 11);
        expect(ctx.workResponsibleId).toBe(387);
        const fail = build(ctx).find(p => p.items.event_type === 'ev_fail');
        expect(fail?.values.responsible).toBe(387);
    });

    it('продажа — так же', () => {
        expect(makeCtx(null, 'success', 11).workResponsibleId).toBe(387);
    });

    it('работа продолжается — на ответственном плана', () => {
        expect(makeCtx(null, 'inJob', 11).workResponsibleId).toBe(11);
    });
});
