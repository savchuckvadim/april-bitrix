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
        notCaType: { installed: true, currentCode: null, items: [] },
        blackShort: false,
        blackShortReason: null,
        nppReported: false,
        duplicateChecked: false,
        boostSale: false,
        history: [],
        baseDealId: null,
        xoDealId: null,
        saleReadiness: { ready: false, missing: ['Статус заявки'] },
        warnings: [],
        ...over,
    }) as LeadRequestCard;

describe('lead-request-view', () => {
    it('незакрытые отметки — уточнение, а не провал', () => {
        expect(getReadinessBadge(makeCard())).toEqual({
            tone: 'warning',
            label: 'Отработана не до конца: 1',
            missing: ['Статус заявки'],
            // Подсказка бэйджа отвечает на вопрос, который он сам и вызывает:
            // «не до конца — а что осталось?»
            hint: 'Отработана не до конца: 1. Осталось отметить: Статус заявки',
        });
        expect(
            getReadinessBadge(
                makeCard({ saleReadiness: { ready: true, missing: [] } }),
            ).tone,
        ).toBe('success');
    });

    // Компания и «не ЦА» больше не условие: заявка без них законная
    // (решение владельца 15.09) — бейдж считает только отметки с бэка.
    it('без компании и без «не ЦА» заявка отработана', () => {
        const badge = getReadinessBadge(
            makeCard({ saleReadiness: { ready: true, missing: [] } }),
        );
        expect(badge.tone).toBe('success');
        expect(badge.label).toBe('Отработана');
        expect(badge.missing).toEqual([]);
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
