import { describe, expect, it } from 'vitest';
import { EV_PLAN_CODE } from '../type/event-plan-type';
import { getAllowedPlanCodes } from './plan-rules';

describe('getAllowedPlanCodes', () => {
    it('компания — все пять типов', () => {
        expect(getAllowedPlanCodes('company', false)).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
            EV_PLAN_CODE.HOT,
            EV_PLAN_CODE.PAY,
            EV_PLAN_CODE.SUPPLY,
        ]);
    });

    it('сделка без компании — звонок, презентация, решение', () => {
        expect(getAllowedPlanCodes('dealNoCompany', false)).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
            EV_PLAN_CODE.HOT,
        ]);
    });

    it('лид и неизвестный контекст — только звонок', () => {
        expect(getAllowedPlanCodes('lead', false)).toEqual([EV_PLAN_CODE.WARM]);
        expect(getAllowedPlanCodes('unknown', false)).toEqual([
            EV_PLAN_CODE.WARM,
        ]);
    });

    it('ТМЦ — пересечение правил, а не победа ветки', () => {
        expect(getAllowedPlanCodes('company', true)).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
        ]);
        expect(getAllowedPlanCodes('dealNoCompany', true)).toEqual([
            EV_PLAN_CODE.WARM,
            EV_PLAN_CODE.PRESENTATION,
        ]);
        expect(getAllowedPlanCodes('lead', true)).toEqual([EV_PLAN_CODE.WARM]);
    });
});
