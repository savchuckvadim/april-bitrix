import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppDispatch, RootState } from '@/modules/app/model/store';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';

import type { ChecklistDef } from '../type/call-checklist.type';
import {
    isHiddenChecklistReportReady,
    reportHiddenChecklistQuestions,
    resetHiddenChecklistReportForTests,
} from './ChecklistHiddenThunk';

/**
 * СПРЯТАННЫЕ ВОПРОСЫ АНКЕТЫ — метрика, ради которой весь заход и делался:
 * «включил настройку на портале, а вопросов нет» стоило владельцу часа.
 *
 * РЕГРЕССИЯ (M8 из разбора). Отчёт уходил, как только каталог анкет отдал
 * непустой состав, — то есть ДО того, как приезжали данные, по которым
 * причина и вычисляется. Слепок портала стартует в appInit без await и
 * доходит своим листенером; строка базовой сделки во встройке-компании
 * догружается лениво. При `portal === null` встроенный вопрос не находил
 * поля и получал причину «поля нет на портале», при пустых строках — «нет
 * носителя». То есть на ИСПРАВНОМ портале каждая сессия слала пачку ложных
 * диагнозов, неотличимых от настоящей поломки, а дедупликация за сессию
 * фиксировала ложь навсегда.
 *
 * До этой правки у thunk'а не было ни одного теста.
 */

const collected = vi.hoisted(() => ({
    hidden: [] as Array<{ reason: string; channel: string; domain?: string }>,
}));

vi.mock('@/modules/shared/metrics/lib/business-metrics', () => ({
    countHiddenChecklistQuestion: (params: {
        reason: string;
        channel: string;
        domain?: string;
    }) => {
        collected.hidden.push(params);
    },
    countDeliveryAttempt: () => undefined,
    countReportOutcome: () => undefined,
    countSend: () => undefined,
    observeBootPhase: () => undefined,
    observeBootToTasks: () => undefined,
    publishOutboxLevel: () => undefined,
}));

const DOMAIN = 'test.bitrix24.ru';

/**
 * Один вопрос встроенного набора — движок перебирает все, а тесту нужен
 * ровно один диагноз. Код берётся из каталога, а не пишется руками: смена
 * состава каталога не должна ронять проверку метрики.
 */
const REFINE = FALLBACK_CATALOG.find(def => def.code === 'refine')!;
const DEF: ChecklistDef = { ...REFINE, items: [REFINE.items[0]!] };
const FIELD_CODE = REFINE.items[0]!.code;
const CHANNEL = REFINE.items[0]!.channel;
const DEAL_ROW = { ID: '10' };

/** Слепок портала со ВСЕМИ вопросами набора — «на портале всё заведено». */
const portalWithField = () => ({
    bitrixDeal: {
        bitrixfields: [
            {
                code: FIELD_CODE,
                bitrixId: FIELD_CODE.toUpperCase(),
                items: [{ code: 'op_x', name: 'Да', bitrixId: 1 }],
            },
        ],
    },
});

/** Слепок портала БЕЗ поля — настоящая поломка, её и надо увидеть. */
const portalWithoutField = () => ({ bitrixDeal: { bitrixfields: [] } });

const makeState = (over: {
    portal?: unknown;
    deal?: Record<string, unknown> | null;
    predictStatus?: 'idle' | 'loading' | 'ready' | 'error';
    baseDealId?: number | null;
    baseDeal?: {
        id: number | null;
        row: Record<string, unknown> | null;
        status: 'idle' | 'loading' | 'ready' | 'error';
    };
}): RootState =>
    ({
        app: {
            domain: DOMAIN,
            bitrix: {
                company: null,
                deal: over.deal ?? null,
                lead: null,
            },
        },
        stagePredict: {
            status: over.predictStatus ?? 'idle',
            requestKey: null,
            result: over.baseDealId ? { baseDealId: over.baseDealId } : null,
        },
        callChecklist: {
            baseDeal: over.baseDeal ?? {
                id: null,
                row: null,
                status: 'idle',
            },
        },
        portal: { portal: over.portal ?? null },
    }) as unknown as RootState;

const report = (state: RootState): void => {
    const dispatch = (() => undefined) as unknown as AppDispatch;
    reportHiddenChecklistQuestions([DEF])(dispatch, () => state);
};

beforeEach(() => {
    resetHiddenChecklistReportForTests();
    collected.hidden.length = 0;
});

describe('ложных срабатываний нет: пока данные едут — молчим', () => {
    it('слепка портала ещё нет — ни одного отчёта', () => {
        // Ровно та ситуация, которая шумела: каталог анкет уже отдал состав,
        // сделка в сторе есть, а слепок портала ещё не приехал. Резолв
        // назовёт причину «поля нет на портале» — и это будет неправдой.
        report(makeState({ portal: null, deal: DEAL_ROW }));

        expect(collected.hidden).toEqual([]);
    });

    it('базовая сделка ещё догружается — ни одного отчёта', () => {
        // Встройка-компания: сделки в сторе нет, предикт назвал базовую, но
        // её строка ещё едет. Резолв назовёт «нет носителя» — тоже неправда.
        report(
            makeState({
                portal: portalWithField(),
                deal: null,
                predictStatus: 'ready',
                baseDealId: 10,
                baseDeal: { id: 10, row: null, status: 'loading' },
            }),
        );

        expect(collected.hidden).toEqual([]);
    });

    it('предикт ещё едет — базовой сделки может и не оказаться, ждём', () => {
        report(
            makeState({
                portal: portalWithField(),
                deal: null,
                predictStatus: 'loading',
            }),
        );

        expect(collected.hidden).toEqual([]);
    });

    /**
     * Главное свойство: ложный диагноз не просто не уходит СЕЙЧАС — он не
     * занимает место в дедупликации, поэтому настоящий диагноз по тому же
     * вопросу уедет, когда данные приедут.
     */
    it('после догрузки уезжает НАСТОЯЩАЯ причина, а ложная не съела дедупликацию', () => {
        const loading = makeState({
            portal: portalWithoutField(),
            deal: null,
            predictStatus: 'ready',
            baseDealId: 10,
            baseDeal: { id: 10, row: null, status: 'loading' },
        });

        report(loading);
        expect(collected.hidden).toEqual([]);

        const loaded = makeState({
            portal: portalWithoutField(),
            deal: null,
            predictStatus: 'ready',
            baseDealId: 10,
            baseDeal: { id: 10, row: DEAL_ROW, status: 'ready' },
        });

        report(loaded);

        expect(collected.hidden).toEqual([
            {
                reason: 'field-not-in-portal',
                channel: CHANNEL,
                domain: DOMAIN,
            },
        ]);
    });
});

describe('настоящая поломка портала считается', () => {
    it('поля нет в слепке — причина уезжает с каналом и доменом', () => {
        report(makeState({ portal: portalWithoutField(), deal: DEAL_ROW }));

        expect(collected.hidden).toEqual([
            {
                reason: 'field-not-in-portal',
                channel: CHANNEL,
                domain: DOMAIN,
            },
        ]);
    });

    it('носителя нет по-настоящему — догружать нечего, диагноз честный', () => {
        // Предикта нет вовсе (лид-контекст): базовая сделка не приедет
        // никогда, значит «нет носителя» — не гонка загрузки, а факт.
        report(makeState({ portal: portalWithField(), deal: null }));

        expect(collected.hidden).toEqual([
            { reason: 'no-carrier', channel: CHANNEL, domain: DOMAIN },
        ]);
    });

    it('повторный показ анкеты счётчик не раздувает', () => {
        const state = makeState({
            portal: portalWithoutField(),
            deal: DEAL_ROW,
        });

        report(state);
        report(state);
        report(state);

        expect(collected.hidden).toHaveLength(1);
    });

    it('на исправном портале не отчитывается ничего', () => {
        report(makeState({ portal: portalWithField(), deal: DEAL_ROW }));

        expect(collected.hidden).toEqual([]);
    });
});

describe('готовность данных — общее условие для отчёта и для эффекта показа', () => {
    it('без слепка портала не готово, с ним и приехавшей сделкой — готово', () => {
        expect(
            isHiddenChecklistReportReady(
                makeState({ portal: null, deal: DEAL_ROW }),
            ),
        ).toBe(false);
        expect(
            isHiddenChecklistReportReady(
                makeState({ portal: portalWithField(), deal: DEAL_ROW }),
            ),
        ).toBe(true);
    });

    it('провал догрузки базовой сделки готовности не отменяет', () => {
        // Строки не будет никогда — «нет носителя» становится правдой, и
        // молчать дальше значило бы прятать настоящую поломку.
        expect(
            isHiddenChecklistReportReady(
                makeState({
                    portal: portalWithField(),
                    deal: null,
                    predictStatus: 'ready',
                    baseDealId: 10,
                    baseDeal: { id: 10, row: null, status: 'error' },
                }),
            ),
        ).toBe(true);
    });
});
