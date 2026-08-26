import { describe, expect, it } from 'vitest';
import {
    PBX_SALES_EVENT_FIELD_CODES,
} from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import {
    flagToPortalValue,
    toFlag,
    toInputDate,
    xvostToAnswerValue,
} from './xvost-fields';

describe('toFlag', () => {
    it('читает диалект CRM (1/0) и диалект опросника (Y/N)', () => {
        expect(toFlag('1')).toBe(true);
        expect(toFlag('0')).toBe(false);
        expect(toFlag('Y')).toBe(true);
        expect(toFlag('N')).toBe(false);
    });

    it('понимает честные boolean/number и пустоту', () => {
        expect(toFlag(true)).toBe(true);
        expect(toFlag(1)).toBe(true);
        expect(toFlag(false)).toBe(false);
        expect(toFlag(undefined)).toBe(false);
        expect(toFlag('')).toBe(false);
    });
});

describe('flagToPortalValue', () => {
    it('пишет в диалекте персиста опросника', () => {
        expect(flagToPortalValue(true)).toBe('Y');
        expect(flagToPortalValue(false)).toBe('N');
    });
});

describe('xvostToAnswerValue', () => {
    it('флаг → boolean-ответ опросника (Y/N-диалект портала)', () => {
        expect(
            xvostToAnswerValue(
                PBX_SALES_EVENT_FIELD_CODES.op_xvost_is_offer,
                'Y',
            ),
        ).toBe(true);
        expect(
            xvostToAnswerValue(
                PBX_SALES_EVENT_FIELD_CODES.op_xvost_is_price,
                'N',
            ),
        ).toBe(false);
    });

    it('дата остаётся строкой того же диалекта YYYY-MM-DD', () => {
        expect(
            xvostToAnswerValue(
                PBX_SALES_EVENT_FIELD_CODES.op_manager_approach_date,
                '2026-08-25',
            ),
        ).toBe('2026-08-25');
    });
});

describe('toInputDate', () => {
    it('нормализует ISO и CRM-формат к YYYY-MM-DD', () => {
        expect(toInputDate('2026-08-25T03:00:00+03:00')).toBe('2026-08-25');
        expect(toInputDate('25.08.2026')).toBe('2026-08-25');
    });

    it('мусор и пустоту превращает в пустую строку', () => {
        expect(toInputDate('')).toBe('');
        expect(toInputDate(null)).toBe('');
        expect(toInputDate('когда-нибудь')).toBe('');
    });
});
