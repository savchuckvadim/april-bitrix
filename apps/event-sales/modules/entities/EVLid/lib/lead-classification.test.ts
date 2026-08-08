import { describe, expect, it } from 'vitest';
import type { BXLead } from '@workspace/bx';
import type { Portal } from '@workspace/pbx';
import {
    ELeadSignal,
    classifyBxLead,
    classifyLead,
    isSalesLeadStatus,
} from './lead-classification';

/** Портал: sales-категория лида со стадиями + поля op_source_select/op_work_status. */
const portal = {
    lead: {
        categories: [
            {
                group: 'sales',
                code: 'lead_sales',
                stages: [
                    { bitrixId: 'PBX_TAKEN_IN_WORK', code: 'lead_taken_in_work' },
                    { bitrixId: 'PBX_COMPANY_WORK', code: 'lead_company_work' },
                ],
            },
            {
                group: 'service',
                code: 'lead_service',
                stages: [{ bitrixId: 'SRV_NEW', code: 'lead_srv_new' }],
            },
        ],
        bitrixfields: [
            {
                code: 'op_source_select',
                bitrixId: '1700000001',
                items: [
                    { bitrixId: 1247, code: 'op_source_1', name: 'Заявка с сайта' },
                    { bitrixId: 1248, code: 'op_source_2', name: 'Интернет' },
                ],
            },
            { code: 'op_work_status', bitrixId: '1700000002', items: [] },
            { code: 'manager_op', bitrixId: '1700000003', items: [] },
        ],
    },
} as unknown as Portal;

describe('isSalesLeadStatus', () => {
    it('стадия sales-категории → true, service и чужие → false', () => {
        expect(isSalesLeadStatus('PBX_TAKEN_IN_WORK', portal)).toBe(true);
        expect(isSalesLeadStatus('SRV_NEW', portal)).toBe(false);
        expect(isSalesLeadStatus('NEW', portal)).toBe(false);
        expect(isSalesLeadStatus(null, portal)).toBe(false);
    });
});

describe('classifyLead', () => {
    it('ОП по стадии; заявка с сайта по op_source_select', () => {
        const result = classifyLead(
            { statusId: 'PBX_COMPANY_WORK', opSourceRaw: '1247' },
            portal,
        );
        expect(result.isSalesLead).toBe(true);
        expect(result.isSiteRequest).toBe(true);
        expect(result.signals).toContain(ELeadSignal.SALES_STAGE);
        expect(result.signals).toContain(ELeadSignal.SITE_OP_SOURCE);
    });

    it('SOURCE_ID=WEB — заявка с сайта (и значит точно ОП-воронка лидогена)', () => {
        const result = classifyLead({ sourceId: 'web' }, portal);
        expect(result.isSiteRequest).toBe(true);
        expect(result.isSalesLead).toBe(true);
        expect(result.signals).toEqual([ELeadSignal.SITE_SOURCE_ID]);
    });

    it('op_source_2 («Интернет») — НЕ заявка с сайта', () => {
        const result = classifyLead({ opSourceRaw: '1248' }, portal);
        expect(result.isSiteRequest).toBe(false);
        expect(result.isSalesLead).toBe(false);
    });

    it('заполнен «Код партнёра» — заявка с сайта', () => {
        const result = classifyLead({ regNumber: '78-00751' }, portal);
        expect(result.isSiteRequest).toBe(true);
        expect(result.signals).toEqual([ELeadSignal.SITE_REG_NUMBER]);
    });

    it('ответственный из отдела продаж — ОП-сигнал', () => {
        const result = classifyLead(
            { responsibleId: 447 },
            portal,
            new Set([447]),
        );
        expect(result.isSalesLead).toBe(true);
        expect(result.signals).toEqual([ELeadSignal.SALES_RESPONSIBLE]);
    });

    it('пустой вход — ничего', () => {
        const result = classifyLead({}, portal);
        expect(result).toEqual({
            isSalesLead: false,
            isSiteRequest: false,
            signals: [],
        });
    });
});

describe('classifyBxLead', () => {
    it('полный лид: UF-поля резолвятся по слепку, quest-url — сайт', () => {
        const lead = {
            ID: 318051,
            STATUS_ID: 'PBX_TAKEN_IN_WORK',
            SOURCE_ID: 'CALL',
            ASSIGNED_BY_ID: '447',
            UF_CRM_1700000001: 1247,
            UF_CRM_1700000002: '55',
            UF_CRM_LEAD_QUEST_URL: 'https://site/quest/1',
        } as unknown as BXLead;

        const result = classifyBxLead(lead, portal);
        expect(result.isSalesLead).toBe(true);
        expect(result.isSiteRequest).toBe(true);
        expect(result.signals).toEqual(
            expect.arrayContaining([
                ELeadSignal.SALES_STAGE,
                ELeadSignal.SALES_FIELDS,
                ELeadSignal.SITE_OP_SOURCE,
                ELeadSignal.SITE_QUEST_URL,
            ]),
        );
    });
});
