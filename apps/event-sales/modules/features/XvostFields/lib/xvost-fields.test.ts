import { describe, expect, it } from 'vitest';
import { PBX_SALES_EVENT_FIELD_CODES } from '@workspace/pbx-data/entities/field/type/sales/event/pbx-sales-event-field.type';
import {
    toInputDate,
    toXvostPortalValue,
    xvostToAnswerValue,
    XVOST_DATE_FIELDS,
} from './xvost-fields';

/**
 * Блок «Хвоста» в модалке «Поля сущности» после переделки 01.09.2026.
 *
 * От блока осталась одна дата — звонок по решению. Три галочки стали частью
 * связного текста «ЧТО ПРЕДЛОЖИЛИ» (сменился и смысл, и тип), «согласование
 * даты» и «дата похода к руководителю» из состава ушли. Тесты на флаги
 * удалены вместе с самими флагами: проверять пустое понятие нечего.
 */

const DECISION_CALL_DATE =
    PBX_SALES_EVENT_FIELD_CODES.op_xvost_decision_call_date;

describe('состав блока', () => {
    it('одна дата — звонок по решению', () => {
        expect(XVOST_DATE_FIELDS).toHaveLength(1);
        expect(XVOST_DATE_FIELDS[0]!.code).toBe(DECISION_CALL_DATE);
    });
});

describe('xvostToAnswerValue', () => {
    it('дата остаётся строкой того же диалекта YYYY-MM-DD', () => {
        expect(xvostToAnswerValue(DECISION_CALL_DATE, '2026-08-25')).toBe(
            '2026-08-25',
        );
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

describe('toXvostPortalValue', () => {
    it('дата уходит каноном CRM, а не строкой контрола', () => {
        expect(toXvostPortalValue(DECISION_CALL_DATE, '2026-08-25')).toBe(
            '25.08.2026',
        );
    });

    it('пустая дата стирает поле, неразбираемая — не пишется вовсе', () => {
        expect(toXvostPortalValue(DECISION_CALL_DATE, '')).toBe('');
        expect(toXvostPortalValue(DECISION_CALL_DATE, 'потом')).toBeNull();
    });
});
