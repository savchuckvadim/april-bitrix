import { describe, expect, it } from 'vitest';
import { EV_PLAN_CODE } from '../type/event-plan-type';
import { getAllowedPlanCodes } from './plan-rules';

describe('getAllowedPlanCodes', () => {
    it('компания — все пять типов', () => {
        expect(getAllowedPlanCodes({ context: 'company', isTmc: false })).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
            EV_PLAN_CODE.HOT,
            EV_PLAN_CODE.PAY,
            EV_PLAN_CODE.SUPPLY,
        ]);
    });

    it('сделка без компании — звонок, презентация, решение', () => {
        expect(getAllowedPlanCodes({ context: 'dealNoCompany', isTmc: false })).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
            EV_PLAN_CODE.HOT,
        ]);
    });

    it('лид и неизвестный контекст — только звонок', () => {
        expect(getAllowedPlanCodes({ context: 'lead', isTmc: false })).toEqual([EV_PLAN_CODE.WARM]);
        expect(getAllowedPlanCodes({ context: 'unknown', isTmc: false })).toEqual([
            EV_PLAN_CODE.WARM,
        ]);
    });

    it('ТМЦ — пересечение правил, а не победа ветки', () => {
        expect(getAllowedPlanCodes({ context: 'company', isTmc: true })).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
        ]);
        expect(getAllowedPlanCodes({ context: 'dealNoCompany', isTmc: true })).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
        ]);
        expect(getAllowedPlanCodes({ context: 'lead', isTmc: true })).toEqual([EV_PLAN_CODE.WARM]);
    });

    it('после продажи остаётся только «Поставка»', () => {
        expect(
            getAllowedPlanCodes({
                context: 'company',
                isTmc: false,
                isAfterSale: true,
            }),
        ).toEqual([EV_PLAN_CODE.SUPPLY]);
    });

    it('менеджер может раскрыть полный список вопреки сужению', () => {
        expect(
            getAllowedPlanCodes({
                context: 'company',
                isTmc: false,
                isAfterSale: true,
                isAllTypesShown: true,
            }),
        ).toHaveLength(5);
    });

    it('там, где «Поставки» нет в контексте, сужать нечем', () => {
        expect(
            getAllowedPlanCodes({
                context: 'lead',
                isTmc: false,
                isAfterSale: true,
            }),
        ).toEqual([EV_PLAN_CODE.WARM]);
    });
});
