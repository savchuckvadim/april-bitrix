import { describe, expect, it } from 'vitest';
import {
    getHistoryNewestFirst,
    getPanelLeadId,
    getReadinessBadge,
    shouldShowNotCaSelect,
} from './lead-request-view';
import { LEAD_SITE_STATUS_CODE } from '../model';
import type { LeadRequestCard } from '../model';

const makeCard = (over: Partial<LeadRequestCard> = {}): LeadRequestCard =>
    ({
        leadId: 42,
        title: 'ООО Ромашка',
        isRequest: true,
        requestSignals: [],
        questUrl: null,
        regNumber: null,
        siteStatus: { installed: true, currentCode: null, items: [] },
        siteStage: { installed: true, currentCode: null, items: [] },
        leadStatus: { installed: true, currentCode: null, items: [] },
        notCaType: { installed: true, currentCode: null, items: [] },
        relatedBaseStage: { installed: false, currentCode: null, items: [] },
        blackShort: false,
        blackShortReason: null,
        isCompany: false,
        nppReported: false,
        duplicateChecked: false,
        duplicateFound: false,
        mergedByExist: false,
        boostSale: false,
        history: [],
        baseDealId: null,
        xoDealId: null,
        saleReadiness: { ready: false, missing: ['Статус заявки'] },
        warnings: [],
        ...over,
    }) as LeadRequestCard;

describe('lead-request-view', () => {
    it('заявка с компанией отработана; незакрытые отметки — уточнение', () => {
        expect(getReadinessBadge(makeCard(), { hasCompany: true })).toEqual({
            tone: 'warning',
            label: 'Отработана не до конца: 1',
            missing: ['Статус заявки'],
            isCompanyMissing: false,
        });
        expect(
            getReadinessBadge(
                makeCard({ saleReadiness: { ready: true, missing: [] } }),
                { hasCompany: true },
            ).tone,
        ).toBe('success');
    });

    it('ни компании, ни «не ЦА» — заявка не отработана', () => {
        const badge = getReadinessBadge(
            makeCard({ saleReadiness: { ready: true, missing: [] } }),
            { hasCompany: false },
        );
        expect(badge.tone).toBe('destructive');
        expect(badge.isCompanyMissing).toBe(true);
        expect(badge.missing).toEqual(['Нет компании и не отмечено «не ЦА»']);
    });

    it('селект «не ЦА» виден при статусе «Не ЦА» или уже выбранном типе', () => {
        expect(shouldShowNotCaSelect(makeCard())).toBe(false);
        expect(
            shouldShowNotCaSelect(
                makeCard({
                    siteStatus: {
                        installed: true,
                        currentCode: LEAD_SITE_STATUS_CODE.op_lead_site_status3,
                        items: [],
                    },
                }),
            ),
        ).toBe(true);
    });

    it('история отдаётся свежими записями вверх, исходник не мутируется', () => {
        const card = makeCard({ history: ['старая', 'новая'] });
        expect(getHistoryNewestFirst(card)).toEqual(['новая', 'старая']);
        expect(card.history).toEqual(['старая', 'новая']);
    });

    it('лид панели: первый открытый, иначе первый, иначе undefined', () => {
        expect(
            getPanelLeadId([
                { id: 1, statusSemanticId: 'S' },
                { id: 2, statusSemanticId: 'P' },
            ]),
        ).toBe(2);
        expect(getPanelLeadId([{ id: 1, statusSemanticId: 'F' }])).toBe(1);
        expect(getPanelLeadId([])).toBeUndefined();
        expect(getPanelLeadId(undefined)).toBeUndefined();
    });
});
