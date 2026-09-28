import { describe, expect, it } from 'vitest';
import {
    managerTrends,
    overview,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import { AI_CHECKLIST_TEXT } from '../ai-setup-checklist.texts';
import {
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_STATUS,
} from '../ai-setup-checklist.types';
import { buildAiChecklistItems } from '../ai-setup-checklist.util';
import {
    checklistInput,
    itemOf,
    passportRow,
    readiness,
    readyOverview,
    settings,
} from './ai-setup-checklist.fixtures';

const T = AI_CHECKLIST_TEXT;
const withReadiness = (overrides: Parameters<typeof readiness>[0]) => ({
    settings: settings({ readiness: readiness(overrides) }),
});

describe('гейты готовности: модель, история, презентации', () => {
    it('no-portal-model → ночной пересчёт и 3-е число: срок примерный, без времени', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.PORTAL_MODEL,
            withReadiness({ reasons: ['no-portal-model'] }),
        );
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.eta).toEqual({
            date: '2026-10-03',
            rough: true,
            time: null,
        });
        expect(item?.detail).toBe(
            'Модель строится ночным пересчётом (22:00–06:00) и обновляется 3-го числа: может появиться уже после ближайшей ночи, плановый пересчёт — 03.10.2026; до неё норм нет.',
        );
    });

    it('history-months-below-3 → «История данных портала: 1 из 3», без срока', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.HISTORY,
            withReadiness({
                historyMonths: 1,
                reasons: ['history-months-below-3'],
            }),
        );
        expect(item?.title).toBe('История данных портала: 1 из 3 мес.');
        expect(item?.progress).toEqual({ value: 1, target: 3 });
        expect(item?.eta).toBeNull();
    });

    it('presentations-below-60 → только прогресс: без темпа и срока по historyMonths', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.PRESENTATIONS,
            withReadiness({
                historyMonths: 2,
                presentations: 20,
                reasons: ['presentations-below-60'],
            }),
        );
        expect(item?.title).toBe('Разобрано 20 из 60 презентаций');
        expect(item?.detail).toBe(
            'Для выхода из калибровки нужно 60 разобранных презентаций — копится само.',
        );
        expect(item?.detail).not.toContain('темп');
        expect(item?.progress).toEqual({ value: 20, target: 60 });
        expect(item?.eta).toBeNull();
    });

    it('гейт норм отдельно от калибровочного; без презентаций срока нет', () => {
        const items = buildAiChecklistItems(
            checklistInput(
                withReadiness({
                    presentations: 0,
                    reasons: ['norms-presentations-below-100'],
                }),
            ),
        );
        const norms = items.find(
            item => item.code === AI_CHECKLIST_ITEM.NORMS_PRESENTATIONS,
        );
        expect(norms?.title).toBe('Для норм: 0 из 100 презентаций');
        expect(norms?.eta).toBeNull();
        expect(
            items.find(item => item.code === AI_CHECKLIST_ITEM.PRESENTATIONS),
        ).toBeUndefined();
    });
});

describe('смена версии разбора (comparable)', () => {
    it('excludedBeforeComparable > 0 → «С даты сменилась версия: N ранних разборов…»', () => {
        const base = readyOverview();
        const item = itemOf(AI_CHECKLIST_ITEM.COMPARABLE, {
            overview: {
                ...base,
                comparableFrom: '2026-09-25',
                meta: { ...base.meta, excludedBeforeComparable: 14 },
            },
        });
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.WAIT);
        expect(item?.detail).toBe(
            'С 25.09.2026 разбор идёт по новой версии: 14 ранних разборов не входят в оценки, ряды набираются заново.',
        );
        // Окно периода 31 день → разборы старой версии уйдут из него к 26.10.
        expect(item?.eta?.date).toBe('2026-10-26');
    });

    it('ничего не исключено — пункта нет', () => {
        expect(itemOf(AI_CHECKLIST_ITEM.COMPARABLE)).toBeUndefined();
    });
});

describe('тренды', () => {
    it('нет трендов ни у кого: недели с даты сопоставимости из 8, срок', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TRENDS, {
            overview: {
                ...overview([passportRow()]),
                comparableFrom: '2026-09-01',
            },
        });
        expect(item?.title).toBe('Тренды: 3 из 8 недель');
        expect(item?.progress).toEqual({ value: 3, target: 8 });
        expect(item?.eta?.date).toBe('2026-10-27');
        expect(item?.detail).toContain('8 сравнимых недельных точек');
    });

    it('недель хватает, трендов нет — ждём объёма без срока; есть — готово', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TRENDS, {
            overview: readyOverview([passportRow()]),
        });
        expect(item?.detail).toBe(T.trends.detailVolume);
        expect(item?.eta).toBeNull();
        expect(
            itemOf(AI_CHECKLIST_ITEM.TRENDS, {
                overview: readyOverview([
                    passportRow({ trends: managerTrends() }),
                ]),
            })?.status,
        ).toBe(AI_CHECKLIST_STATUS.DONE);
    });
});

describe('год назад', () => {
    it('истории 4 мес. → прогресс 4 из 13 и срок через 9 мес.', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.YOY, {
            ...withReadiness({ historyMonths: 4 }),
            overview: readyOverview([passportRow()]),
        });
        expect(item?.title).toBe('Год назад: 4 из 13 мес. истории');
        expect(item?.progress).toEqual({ value: 4, target: 13 });
        expect(item?.eta?.rough).toBe(true);
    });

    it('окно модели 12 мес. и yoy нет — без срока, с подсказкой про месяц', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.YOY, {
            overview: readyOverview([passportRow()]),
        });
        expect(item?.detail).toBe(T.yoy.detailLong);
        expect(item?.eta).toBeNull();
    });
});

describe('связь «качество → исход» (beta)', () => {
    it('счётчик → wait: сколько презентаций осталось и срок по monthsLeft', () => {
        const item = itemOf(
            AI_CHECKLIST_ITEM.BETA,
            withReadiness({
                betaSource: 'none',
                betaCountdown: {
                    seNow: 0.4,
                    presentationsLeft: 39.2,
                    monthsLeft: 2,
                },
            }),
        );
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.detail).toContain(
            'нужно ещё ≈ 40 разобранных презентаций',
        );
        expect(item?.eta?.date).toBe('2026-11-26');
    });

    it('по данным — готово; счётчика нет — источник всё равно виден, без срока', () => {
        expect(itemOf(AI_CHECKLIST_ITEM.BETA)?.status).toBe(
            AI_CHECKLIST_STATUS.DONE,
        );
        const item = itemOf(
            AI_CHECKLIST_ITEM.BETA,
            withReadiness({ betaSource: 'hypothesis', betaCountdown: null }),
        );
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.detail).toContain('по гипотезе портала');
        expect(item?.eta).toBeNull();
    });

    it('kpi-only без счётчика — пункта нет: оценок нет вовсе', () => {
        expect(
            itemOf(
                AI_CHECKLIST_ITEM.BETA,
                withReadiness({
                    mode: 'kpi-only',
                    betaSource: 'none',
                    betaCountdown: null,
                }),
            ),
        ).toBeUndefined();
    });
});

describe('неизвестные причины режима', () => {
    it('новый код бэка — отдельный пункт с нейтральной подписью, код только в ключе', () => {
        const items = buildAiChecklistItems(
            checklistInput(withReadiness({ reasons: ['brand-new-gate'] })),
        );
        const reason = items.find(
            item => item.code === AI_CHECKLIST_ITEM.REASON,
        );
        expect(reason?.key).toBe('reason:brand-new-gate');
        expect(reason?.title).toBe('Новая причина режима');
        expect(reason?.detail).toContain('разработчика');
        expect(`${reason?.title} ${reason?.detail}`).not.toContain(
            'brand-new-gate',
        );
    });
});
