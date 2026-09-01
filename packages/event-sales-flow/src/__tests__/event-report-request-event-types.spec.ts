import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { EventReportContext } from '../services/context/event-report.context';
import { EventReportKpiPayloadBuilder } from '../services/kpi-list/event-report-kpi-payload.builder';
import { DealFlowResult } from '../services/deal/event-report-deal-flow.service';
import {
    getSalesBaseTargetStageCode,
    getXoTargetStageCode,
} from '../services/deal/deal-target-stage.calculator';
import { EnumTaskEventType } from '../dto/event-sale-flow/task.dto';

// В рантайме плагины dayjs расширяются при импорте @lib/shared/lib/date;
// юнит-тест воспроизводит это состояние явно.
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Заявка — не холодный обзвон.
 *
 * `xo` — клиент нас не ждёт; `xoRequest` — заявка с сайта; `xoLead` — входящий
 * лид/обращение. По воронке все три ходят одинаково (холодная стадия,
 * воронка ХО), а в KPI обязаны писаться РАЗНЫМИ кодами события: иначе
 * руководитель не отличит холодный обзвон от обработки заявки.
 *
 * Тест закрывает всю цепочку отчёта: контекст → KPI-payload → стадии →
 * таймлайн.
 */
const NOW = new Date('2026-08-10T09:00:00.000Z');

const makePortal = () => ({ getTimezone: () => 'Europe/Moscow' });

const makeCtx = (eventType: string) =>
    new EventReportContext(
        {
            currentTask: { eventType, name: 'ООО Ромашка' },
            report: { resultStatus: 'result' },
        } as never,
        makePortal() as never,
        { entityType: 'deal', entityId: 500, currentPresDeal: null } as never,
        NOW,
    );

const deals: DealFlowResult = {
    baseDealId: null,
    newPlanPresDealId: null,
    newUnplannedPresDealId: null,
};

const buildKpi = (eventType: string) =>
    new EventReportKpiPayloadBuilder(
        makePortal() as never,
        makeCtx(eventType),
        deals,
    ).buildAll();

/** Воронка ОП и воронка ХО с полным набором нужных стадий. */
const salesBaseCategory = {
    stages: [
        { code: 'sales_plan', bitrixId: 'PLAN' },
        { code: 'sales_cold', bitrixId: 'COLD' },
        { code: 'sales_warm', bitrixId: 'WARM' },
    ],
} as never;

const xoCategory = {
    stages: [
        { code: 'cold_pending', bitrixId: 'PENDING' },
        { code: 'cold_success', bitrixId: 'XSUCCESS' },
        { code: 'cold_noresult', bitrixId: 'XNORESULT' },
    ],
} as never;

describe('Типы события «заявка» (xoRequest / xoLead)', () => {
    it('DTO принимает новые коды и не теряет старые', () => {
        const values = Object.values(EnumTaskEventType);
        expect(values).toEqual(
            expect.arrayContaining([
                'xo',
                'xoRequest',
                'xoLead',
                'warm',
                'presentation',
                'hot',
                'moneyAwait',
                'ss',
                'in_progress',
                'money_await',
                'event',
                'supply',
            ]),
        );
    });

    /*
     * Enum задачи — это ещё и ВАЛИДАТОР входа (глобальный ValidationPipe
     * рубит чужой код в 400): кейсы plainToInstance + validate остаются в
     * бэковом спеке — DTO пакета интерфейсные, без class-validator.
     */

    it.each([
        ['xo', 'xo'],
        ['xoRequest', 'xoRequest'],
        ['xoLead', 'xoLead'],
        // Старые коды фрейма продолжают сводиться к алфавиту отчётности.
        ['cold', 'xo'],
        ['in_progress', 'hot'],
        ['money_await', 'moneyAwait'],
        ['ss', 'warm'],
    ])('контекст: код задачи %s → тип события %s', (raw, expected) => {
        expect(makeCtx(raw).reportEventType).toBe(expected);
    });

    /*
     * Раньше несведённый код проезжал строкой и не совпадал ни с лестницей
     * стадий, ни с маппингом KPI — отчёт уходил успешно, а записи молча
     * пропадали. Теперь тип всегда валиден.
     */
    it('контекст: неизвестный код не теряется, а трактуется как разговор', () => {
        expect(makeCtx('чтототакое').reportEventType).toBe('warm');
    });

    it.each([
        ['xo', 'xo'],
        ['xoRequest', 'site'],
        ['xoLead', 'come_call'],
    ])('KPI: тип %s пишется кодом события %s', (eventType, expectedItem) => {
        const payloads = buildKpi(eventType);
        expect(payloads).toHaveLength(1);
        expect(payloads[0].items.event_type).toBe(expectedItem);
        expect(payloads[0].items.event_action).toBe('done');
    });

    it('KPI: заявка НЕ сливается с холодным обзвоном', () => {
        const site = buildKpi('xoRequest')[0].items.event_type;
        const lead = buildKpi('xoLead')[0].items.event_type;
        const cold = buildKpi('xo')[0].items.event_type;
        expect(new Set([site, lead, cold]).size).toBe(3);
    });

    it('KPI: неизвестный код всё равно даёт запись (никогда не null)', () => {
        const payloads = buildKpi('чтототакое');
        expect(payloads).toHaveLength(1);
        expect(payloads[0].items.event_type).toBe('call');
    });

    it.each(['xo', 'xoRequest', 'xoLead'] as const)(
        'стадии: %s держит основную сделку на холодной стадии',
        eventType => {
            expect(
                getSalesBaseTargetStageCode({
                    category: salesBaseCategory,
                    currentStageEvent: null,
                    planEventType: null,
                    reportEventType: eventType,
                    isResult: true,
                    isUnplanned: false,
                    isSuccess: false,
                    isFail: false,
                    isNoResult: false,
                    isNotCa: false,
                }),
            ).toBe('COLD');
        },
    );

    it.each(['xo', 'xoRequest', 'xoLead'] as const)(
        'стадии: отчёт %s двигает воронку ХО (раньше двигал только литерал xo)',
        eventType => {
            expect(
                getXoTargetStageCode({
                    category: xoCategory,
                    reportEventType: eventType,
                    isExpired: false,
                    isResult: true,
                    isSuccess: false,
                    isFail: false,
                }),
            ).toBe('XSUCCESS');
        },
    );

    /*
     * Кейсы EventReportTaskFlowService (контракт заголовка «Холодный
     * обзвон. Заявка/Лид», перенос: только дедлайн / замена названия,
     * «не очень» без плана и с отказом) и таймлайна
     * (EventReportEntityHistoryService: русское название типа) остаются
     * в бэковом спеке — сервисы I/O, пакет получает их в А2.
     */

    /*
     * Перенос без выбранного типа плана (тип при переносе не меняют) обязан
     * дать запись «Перенос» с типом события отчёта: раньше отчётную запись
     * глушил isExpired, а плановую — isPlanned, и в KPI/историю не уходило
     * НИЧЕГО.
     */
    it('перенос без типа плана пишет запись «Перенос» типом события отчёта', () => {
        const ctx = new EventReportContext(
            {
                currentTask: {
                    id: 900,
                    eventType: 'xoRequest',
                    name: 'ООО Ромашка',
                },
                report: {
                    resultStatus: 'noresult',
                    workStatus: { current: { code: 'inJob' } },
                },
                plan: { isActive: true, isPlanned: false, deadline: '' },
            } as never,
            makePortal() as never,
            {
                entityType: 'deal',
                entityId: 500,
                currentPresDeal: null,
            } as never,
            NOW,
        );

        expect(ctx.isExpired).toBe(true);

        const payloads = new EventReportKpiPayloadBuilder(
            makePortal() as never,
            ctx,
            deals,
        ).buildAll();

        const plan = payloads.find(p => p.items?.event_action === 'pound');
        expect(plan).toBeDefined();
        // Заявка пишется своим KPI-кодом `site` («Заявка с сайта»).
        expect(plan?.items?.event_type).toBe('site');
        expect(payloads).toHaveLength(1);
    });
});
