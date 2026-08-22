import { describe, expect, it } from 'vitest';
import type { LeadRequestCard } from '../model';
import {
    NOT_CA_LEAD_STATUS_CODE,
    NOT_CA_SITE_STATUS_CODE,
    isNotCaPatch,
    needsNotCaType,
} from './not-ca-rule';

const card = (notCaTypeCode: string | null): LeadRequestCard =>
    ({ notCaType: { currentCode: notCaTypeCode } }) as LeadRequestCard;

describe('isNotCaPatch', () => {
    it('ловит «не ЦА» и в статусе заявки, и в статусе лида', () => {
        expect(isNotCaPatch({ siteStatusCode: NOT_CA_SITE_STATUS_CODE })).toBe(
            true,
        );
        expect(isNotCaPatch({ leadStatusCode: NOT_CA_LEAD_STATUS_CODE })).toBe(
            true,
        );
    });

    it('другие статусы правилом не задевает', () => {
        expect(isNotCaPatch({ siteStatusCode: 'op_lead_site_status1' })).toBe(
            false,
        );
        expect(isNotCaPatch({ siteStageCode: 'op_lead_site_stage1' })).toBe(
            false,
        );
    });
});

describe('needsNotCaType', () => {
    it('типа нет ни в правке, ни на лиде — спрашиваем', () => {
        expect(
            needsNotCaType(
                { siteStatusCode: NOT_CA_SITE_STATUS_CODE },
                card(null),
            ),
        ).toBe(true);
    });

    it('тип уже стоит на лиде — портал примет, не спрашиваем', () => {
        expect(
            needsNotCaType(
                { siteStatusCode: NOT_CA_SITE_STATUS_CODE },
                card('op_lead_not_ca_type1'),
            ),
        ).toBe(false);
    });

    it('тип передан в той же правке — не спрашиваем', () => {
        expect(
            needsNotCaType(
                {
                    siteStatusCode: NOT_CA_SITE_STATUS_CODE,
                    notCaTypeCode: 'op_lead_not_ca_type2',
                },
                card(null),
            ),
        ).toBe(false);
    });

    it('правка не про «не ЦА» — не спрашиваем', () => {
        expect(
            needsNotCaType({ siteStageCode: 'op_lead_site_stage2' }, card(null)),
        ).toBe(false);
    });
});
