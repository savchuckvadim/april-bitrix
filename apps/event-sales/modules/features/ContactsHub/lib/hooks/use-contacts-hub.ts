'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { useCurrentRelations } from '@/modules/entities/RelatedCrm';
import {
    HubFilters,
    HubRow,
    HubSource,
    buildHubRows,
    collectHubSources,
    filterHubRows,
} from '../contacts-hub-view';

export interface ContactsHubData {
    rows: HubRow[];
    totalCount: number;
    availableSources: HubSource[];
    filters: HubFilters;
    toggleSource: (source: HubSource) => void;
    toggleOnlyWithPhone: () => void;
    /** Связи ещё едут — для скелетона хвоста списка. */
    isRelatedLoading: boolean;
    domain: string;
}

/**
 * Данные виджета «Все контакты»: контакты стора (уже собраны листенерами по
 * всем связям), точки связи лида и контакты связей с бэка. Запрос связей
 * гейтится `enabled` — виджет закрыт свёрнутым, и дёргать бэк до первого
 * раскрытия незачем (паттерн RecordsList).
 */
export const useContactsHub = (enabled: boolean): ContactsHubData => {
    const domain = useAppSelector(s => s.app.domain);
    const contacts = useAppSelector(s => s.contact.contacts);
    const sourceById = useAppSelector(s => s.contact.sourceById);
    const planContactId = useAppSelector(s =>
        s.contact.current.plan ? Number(s.contact.current.plan.ID) : null,
    );
    const reportContactId = useAppSelector(s =>
        s.contact.current.report ? Number(s.contact.current.report.ID) : null,
    );
    const lead = useAppSelector(
        s => s.app.bitrix.lead as Record<string, unknown> | null,
    );

    // Связи уже в сторе (их грузит листенер для шапки) — гейт не нужен.
    const related = useCurrentRelations();

    const [selectedSources, setSelectedSources] = useState<
        ReadonlySet<HubSource>
    >(new Set());
    const [onlyWithPhone, setOnlyWithPhone] = useState(false);

    const allRows = useMemo(
        () =>
            buildHubRows({
                contacts,
                sourceById,
                planContactId,
                reportContactId,
                lead,
                details: related.details,
            }),
        [
            contacts,
            sourceById,
            planContactId,
            reportContactId,
            lead,
            related.details,
        ],
    );

    const filters: HubFilters = { sources: selectedSources, onlyWithPhone };

    return {
        rows: filterHubRows(allRows, filters),
        totalCount: allRows.length,
        availableSources: collectHubSources(allRows),
        filters,
        toggleSource: source =>
            setSelectedSources(prev => {
                const next = new Set(prev);
                if (next.has(source)) next.delete(source);
                else next.add(source);
                return next;
            }),
        toggleOnlyWithPhone: () => setOnlyWithPhone(value => !value),
        isRelatedLoading: enabled && related.status === 'loading',
        domain,
    };
};
