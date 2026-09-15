import { describe, expect, it } from 'vitest';
import { FALLBACK_CATALOG } from '@/modules/entities/Questionnaire/data/fallback-catalog';
import { answerKey } from '@/modules/entities/Questionnaire/lib/answer-key';
import {
    getChecklistDraftKey,
    parseChecklistDraft,
    pickChecklistDraftAnswers,
} from './checklist-draft';

/**
 * Черновик ответов анкет: что переживает перезагрузку фрейма. Ответ
 * crm-канала не переживает НАМЕРЕННО — он в карточке клиента, и подменять
 * свежее значение портала сохранённым нельзя.
 */
describe('checklist-draft', () => {
    const SALE_OPPORTUNITY = answerKey('sale', 'OPPORTUNITY');
    const SALE_PAY_DATE = answerKey('sale', 'first_pay_date');
    const REFINE_DEF = FALLBACK_CATALOG.find(def => def.code === 'refine')!;
    const REFINE_ANSWER = answerKey(REFINE_DEF.code, REFINE_DEF.items[0]!.code);

    it('в черновик уходят только ответы не-crm каналов', () => {
        const draft = pickChecklistDraftAnswers(FALLBACK_CATALOG, {
            [SALE_OPPORTUNITY]: '250000',
            [SALE_PAY_DATE]: '2026-09-24',
            [REFINE_ANSWER]: 'op_efield_fail_lpr',
        });

        expect(draft).toEqual({
            [SALE_OPPORTUNITY]: '250000',
            [SALE_PAY_DATE]: '2026-09-24',
        });
    });

    it('пустые ответы в черновик не пишутся', () => {
        expect(
            pickChecklistDraftAnswers(FALLBACK_CATALOG, {
                [SALE_OPPORTUNITY]: '',
            }),
        ).toEqual({});
    });

    it('ключ различает клиента и пользователя', () => {
        const company = getChecklistDraftKey(
            'x.bitrix24.ru',
            false,
            null,
            5,
            7,
        );
        const lead = getChecklistDraftKey('x.bitrix24.ru', true, 9, null, 7);
        const otherUser = getChecklistDraftKey(
            'x.bitrix24.ru',
            false,
            null,
            5,
            8,
        );

        expect(company).toBe('x.bitrix24.ru_co_5_7_checklist');
        expect(lead).toBe('x.bitrix24.ru_lead_9_7_checklist');
        expect(otherUser).not.toBe(company);
    });

    it('мусор из хранилища разбирается в пустоту, а не в исключение', () => {
        expect(parseChecklistDraft(null)).toEqual({});
        expect(parseChecklistDraft('строка')).toEqual({});
        expect(parseChecklistDraft({ a: 1, b: '', c: 'ок' })).toEqual({
            c: 'ок',
        });
    });
});
