import { describe, expect, it } from 'vitest';
import { pickCalculationInfo, type CalculationInfo } from '../calculation-info';

/*
 * Сведения о расчёте из ответа сервера в виде, пригодном для стора: только
 * корректные поля, а ответ без них (старый сервер, открытый период) — null.
 */

const GENERATED_AT = '2026-11-12T07:40:00.000Z';

describe('pickCalculationInfo', () => {
    it('оба поля: переносятся', () => {
        expect(
            pickCalculationInfo({
                generatedAt: GENERATED_AT,
                closedPeriod: true,
            }),
        ).toEqual({ generatedAt: GENERATED_AT, closedPeriod: true });
    });

    it('closedPeriod false сохраняется — это сведение, а не отсутствие', () => {
        expect(
            pickCalculationInfo({
                generatedAt: GENERATED_AT,
                closedPeriod: false,
            }),
        ).toEqual({ generatedAt: GENERATED_AT, closedPeriod: false });
    });

    it('только одно поле: переносится оно, второго ключа нет', () => {
        expect(pickCalculationInfo({ generatedAt: GENERATED_AT })).toEqual({
            generatedAt: GENERATED_AT,
        });
        expect(pickCalculationInfo({ closedPeriod: true })).toEqual({
            closedPeriod: true,
        });
    });

    it('ни одного поля, пустой ответ или нет ответа: null', () => {
        expect(pickCalculationInfo({})).toBeNull();
        expect(pickCalculationInfo(null)).toBeNull();
        expect(pickCalculationInfo(undefined)).toBeNull();
    });

    it('чужие поля ответа не переносятся', () => {
        const source = {
            status: 'ready',
            requestKey: 'ключ',
            generatedAt: GENERATED_AT,
        };
        expect(pickCalculationInfo(source)).toEqual({
            generatedAt: GENERATED_AT,
        });
    });

    it('поля неверного типа и пустая дата отбрасываются', () => {
        const wrong = { generatedAt: 12345, closedPeriod: 'да' };
        expect(
            pickCalculationInfo(wrong as unknown as CalculationInfo),
        ).toBeNull();
        expect(pickCalculationInfo({ generatedAt: '' })).toBeNull();
    });
});
