import { describe, expect, it } from 'vitest';
import type { AiPlanFact } from '@/modules/entities/ai-analytics';
import {
    dailyPlan,
    planFact,
    planFactRow,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import { AI_CHECKLIST_TEXT } from '../ai-setup-checklist.texts';
import {
    aiCrmPlansFixed,
    aiTargetPresence,
    hasAiTargetPresence,
} from '../ai-setup-checklist.targets';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_STATUS,
} from '../ai-setup-checklist.types';
import {
    itemOf,
    passportRow,
    readyOverview,
    settings,
    TODAY,
} from './ai-setup-checklist.fixtures';

const T = AI_CHECKLIST_TEXT.targets;
const MONTH = TODAY.slice(0, 7);
const noTargets = settings({ targets: { byLevel: [], overrides: [] } });
const juniorOnly = readyOverview([passportRow({ level: 'junior' })]);

/** План-факт текущего месяца (снимок «Планов» есть, план продаж 10). */
const currentPlanFact = (overrides: Partial<AiPlanFact> = {}): AiPlanFact =>
    planFact({
        period: { ...planFact().period, monthKey: MONTH },
        ...overrides,
    });

/** План дня на сегодня без цели ни на одной ступени каскада. */
const emptyDailyPlan = () =>
    dailyPlan({
        managerId: '3',
        target: { sales: 0, source: 'median', warnings: ['target-empty'] },
    });

describe('цель месяца — по порталу, а не по выбранному менеджеру', () => {
    it('целей нет нигде → todo: вкладка «Цели» и «Планы» со снимком 1-го числа', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TARGETS, {
            settings: noTargets,
            planFact: currentPlanFact({ reasons: ['plan-snapshot-missing'] }),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.CONFIGURE);
        expect(item?.detail).toBe(T.detail);
        expect(item?.unlocks).toBe(
            'План дня — цель уровня или личная цель попадёт в него после ночного пересчёта (03:45)',
        );
        expect(item?.unlocks).not.toContain('план-факт');
        expect(item?.actions).toEqual([
            {
                kind: AI_CHECKLIST_ACTION.SETTINGS,
                tab: 'targets',
                label: T.tab,
            },
            { kind: AI_CHECKLIST_ACTION.TEXT, text: T.plans },
        ]);
        expect(T.plans).toContain('1-го числа в 04:00 на новый месяц');
        expect(T.plans).toContain('План-факт сверяет только');
    });

    it('план дня выбранного менеджера без цели не делает пункт todo', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TARGETS, {
            dailyPlan: emptyDailyPlan(),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.DONE);
        // Деталь из плана дня — только пояснение.
        expect(item?.detail).toContain(T.dailyPlanGap('Менеджер 3'));
        expect(
            itemOf(AI_CHECKLIST_ITEM.TARGETS, { dailyPlan: dailyPlan() })
                ?.detail,
        ).toBe(T.doneDetail('цель уровня (Мидл)'));
    });

    it('план дня с целью не закрывает пункт, если целей на портале нет', () => {
        expect(
            itemOf(AI_CHECKLIST_ITEM.TARGETS, {
                settings: noTargets,
                planFact: currentPlanFact({ rows: [], team: [] }),
                dailyPlan: dailyPlan(),
            })?.status,
        ).toBe(AI_CHECKLIST_STATUS.TODO);
    });

    it('цель уровня считается только для уровней из строк обзора', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TARGETS, {
            overview: juniorOnly,
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.detail).toBe(T.detailCrmUnknown);
    });

    it('личная цель или «Планы» в снимке этого месяца → готово с источниками', () => {
        const personal = itemOf(AI_CHECKLIST_ITEM.TARGETS, {
            overview: juniorOnly,
            settings: settings({
                targets: {
                    byLevel: [
                        {
                            level: 'middle',
                            sales: 5,
                            presentationsMin: 0,
                            coldPerDay: 40,
                        },
                    ],
                    overrides: [{ managerId: 7, sales: 3 }],
                },
            }),
        });
        expect(personal?.status).toBe(AI_CHECKLIST_STATUS.DONE);
        expect(personal?.detail).toBe(
            `${T.doneDetail('личные цели — 1')}${T.levelsWithout('Джун')}`,
        );
        expect(
            itemOf(AI_CHECKLIST_ITEM.TARGETS, {
                settings: noTargets,
                planFact: currentPlanFact(),
            })?.detail,
        ).toBe(`${T.doneDetail(T.sourceCrm)}${T.levelsWithout('Мидл')}`);
    });
});

describe('ступени каскада', () => {
    it('«Планы» CRM — только снимок текущего месяца с планом продаж > 0', () => {
        expect(aiCrmPlansFixed(null, MONTH)).toBeNull();
        expect(aiCrmPlansFixed(planFact(), MONTH)).toBeNull();
        expect(aiCrmPlansFixed(currentPlanFact(), MONTH)).toBe(true);
        // Снимок есть, но в периметре план-факта нет менеджеров — не проверить.
        expect(
            aiCrmPlansFixed(currentPlanFact({ rows: [], team: [] }), MONTH),
        ).toBeNull();
        expect(
            aiCrmPlansFixed(
                currentPlanFact({ reasons: ['plan-snapshot-missing'] }),
                MONTH,
            ),
        ).toBe(false);
        expect(
            aiCrmPlansFixed(
                currentPlanFact({
                    rows: [
                        {
                            managerId: '7',
                            rows: [
                                planFactRow({ indicator: 'calls', plan: 50 }),
                            ],
                        },
                    ],
                }),
                MONTH,
            ),
        ).toBe(false);
    });

    it('без обзора цели уровней берём все; пустые и нулевые — не цель', () => {
        const presence = aiTargetPresence(
            settings({
                targets: {
                    byLevel: [
                        {
                            level: 'senior',
                            sales: 4,
                            presentationsMin: 0,
                            coldPerDay: 30,
                        },
                        {
                            level: 'junior',
                            sales: null,
                            presentationsMin: 20,
                            coldPerDay: 50,
                        },
                    ],
                    overrides: [{ managerId: 3, sales: 0 }],
                },
            }),
            null,
            null,
            MONTH,
        );
        expect(presence).toEqual({
            levels: ['senior'],
            levelsWithout: [],
            personal: 0,
            crmPlans: null,
        });
        expect(hasAiTargetPresence(presence)).toBe(true);
        expect(
            hasAiTargetPresence({ ...presence, levels: [], crmPlans: false }),
        ).toBe(false);
    });
});
