import { describe, expect, it } from 'vitest';
import {
    managerRow,
    planFact,
} from '@/modules/entities/ai-analytics/__tests__/ai-fixtures';
import {
    AI_CHECKLIST_ACTION,
    AI_CHECKLIST_GROUP,
    AI_CHECKLIST_ITEM,
    AI_CHECKLIST_STATUS,
} from '../ai-setup-checklist.types';
import {
    itemOf,
    passportRow,
    readiness,
    readyOverview,
    settings,
} from './ai-setup-checklist.fixtures';

describe('планы руководителя (head-plans)', () => {
    const missing = (monthKey: string) =>
        planFact({
            period: { ...planFact().period, monthKey },
            reasons: ['plan-snapshot-missing'],
        });

    it('текущий месяц без снимка → честно: этот месяц без планов, следующий снимок 1-го в 04:00', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.HEAD_PLANS, {
            planFact: missing('2026-09'),
        });
        expect(item?.group).toBe(AI_CHECKLIST_GROUP.CONFIGURE);
        expect(item?.eta).toEqual({
            date: '2026-10-01',
            rough: false,
            time: '04:00',
        });
        expect(item?.detail).toBe(
            'За сентябрь 2026 снимка планов нет — план-факт этого месяца идёт без планов руководителя. Следующий снимок 01.10.2026 в 04:00 зафиксирует планы нового месяца.',
        );
        expect(itemOf(AI_CHECKLIST_ITEM.HEAD_PLANS)).toBeUndefined();
    });

    it('прошлый месяц без снимка — пункта нет: сделать с ним уже нечего', () => {
        expect(
            itemOf(AI_CHECKLIST_ITEM.HEAD_PLANS, {
                planFact: missing('2026-08'),
            }),
        ).toBeUndefined();
    });
});

describe('состав, календарь, гипотеза', () => {
    it('roster-not-confirmed → кнопка «Подтвердить состав» (вкладка roster)', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.ROSTER, {
            settings: settings({
                readiness: readiness({ reasons: ['roster-not-confirmed'] }),
            }),
        });
        expect(item?.actions[0]).toEqual({
            kind: AI_CHECKLIST_ACTION.SETTINGS,
            tab: 'roster',
            label: 'Подтвердить состав',
        });
        expect(itemOf(AI_CHECKLIST_ITEM.ROSTER)?.title).toBe(
            'Состав подтверждён 01.09.2026',
        );
    });

    it('calendar-not-imported — блокер норм, текст про ai_analytics_calendar', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.CALENDAR, {
            settings: settings({
                readiness: readiness({ reasons: ['calendar-not-imported'] }),
            }),
        });
        expect(item?.optional).toBe(false);
        expect(JSON.stringify(item?.actions)).toContain(
            'ai_analytics_calendar',
        );
    });

    it('hypothesis-not-set — рекомендация', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.HYPOTHESIS, {
            settings: settings({
                readiness: readiness({ reasons: ['hypothesis-not-set'] }),
            }),
        });
        expect(item?.optional).toBe(true);
    });
});

describe('стаж (tenure)', () => {
    it('tenureMonths = null → рекомендация «задайте дату в «Уровни»», passport — в порядке', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TENURE, {
            overview: readyOverview([
                passportRow(),
                managerRow({ managerId: '3', tenureMonths: null }),
            ]),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.TODO);
        expect(item?.optional).toBe(true);
        expect(item?.title).toBe('Стаж неизвестен у 1 менеджера');
        expect(item?.detail).toBe(
            'Менеджер 3: стаж ещё не посчитан (нет месячного снимка менеджера) — задайте дату вручную в «Уровни» или дождитесь ночного пересчёта.',
        );
        expect(item?.actions[0]).toMatchObject({ tab: 'levels' });
    });

    it('дата есть, стаж ещё не посчитан — не «стаж не задан»', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TENURE, {
            overview: readyOverview([
                managerRow({ since: '2026-10-01', tenureMonths: null }),
            ]),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.DONE);
    });

    it('стаж известен у всех — готово с разбивкой Bitrix / вручную', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TENURE, {
            overview: readyOverview([
                passportRow(),
                passportRow({ managerId: '3', sinceSource: 'manual' }),
            ]),
        });
        expect(item?.status).toBe(AI_CHECKLIST_STATUS.DONE);
        expect(item?.detail).toBe('По датам Bitrix — 1, задан вручную — 1.');
    });

    it('дата по первому событию (proxy) — отдельно, «приблизительно»', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.TENURE, {
            overview: readyOverview([
                passportRow(),
                passportRow({ managerId: '3', sinceSource: 'proxy' }),
                passportRow({ managerId: '4', sinceSource: 'manual' }),
            ]),
        });
        expect(item?.detail).toBe(
            'По датам Bitrix — 1, приблизительно, по первому событию — 1, задан вручную — 1.',
        );
    });
});

describe('рассылки (push)', () => {
    it('выключены алерты и пуст список РОПов → блокер с ключами админки', () => {
        const item = itemOf(AI_CHECKLIST_ITEM.PUSH, {
            settings: settings({ alertsEnabled: false, ropUserIds: [] }),
        });
        expect(item?.optional).toBe(false);
        expect(item?.detail).toBe('Не настроено: алерты РОПу, список РОПов.');
        expect(JSON.stringify(item?.actions)).toContain(
            'ai_analytics_alerts_enabled, ai_analytics_rop_user_ids',
        );
    });

    it('не хватает только сводного дайджеста — по желанию; всё есть — готово', () => {
        expect(
            itemOf(AI_CHECKLIST_ITEM.PUSH, {
                settings: settings({ digestAllUserIds: [] }),
            })?.optional,
        ).toBe(true);
        expect(itemOf(AI_CHECKLIST_ITEM.PUSH)?.status).toBe(
            AI_CHECKLIST_STATUS.DONE,
        );
    });
});
