'use client';

import { useMemo, useState } from 'react';
import { hasPortalRegions } from '@/modules/entities/catalog';
import {
    isWeightMatching,
    regionCodesWeight,
    regionWeightSurplus,
} from '@/modules/entities/composition';
import type { CompositionEditorState } from './use-composition-editor';
import {
    buildPickerRows,
    draftCodes,
    draftFromComposition,
    draftToAction,
    draftWeight,
    filterCounts,
    isDraftChanged,
    pickerRegions,
    REGIONS_FILTERS,
    setDraftRegionCounted,
    toggleDraftRegion,
    type RegionsFilter,
} from '../lib/regions-picker.util';

/**
 * Окно «Регионы»: выбор регионов состава в черновике. Правки уходят в состав
 * только по «Сохранить» (как окно наполнения строки); «Отмена» и закрытие окна
 * их отбрасывают. Окно монтируется открытым, поэтому исходный выбор берётся при
 * монтировании. Добавленный регион по умолчанию считает вес.
 */
export const useRegionsEditor = (
    editor: CompositionEditorState,
    onClose: () => void,
) => {
    const { catalog, composition, clientRegionCode, weightCheck } = editor;
    const complect = composition
        ? (catalog.complects.byCode[composition.complectCode] ?? null)
        : null;
    const [initial] = useState(() =>
        composition
            ? draftFromComposition(composition)
            : { counted: [], unweighted: [] },
    );
    const [draft, setDraft] = useState(initial);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<RegionsFilter>('all');
    const [showAll, setShowAll] = useState(false);

    const allRegions = catalog.regions.items;
    const rows = useMemo(
        () =>
            buildPickerRows(
                pickerRegions(allRegions, {
                    showAll,
                    clientRegionCode,
                    selectedCodes: draftCodes(draft),
                }),
                draft,
                query,
                filter,
            ),
        [allRegions, showAll, clientRegionCode, draft, query, filter],
    );
    const counts = filterCounts(draft);

    // Вес состава после сохранения: вес без регионов + вес регионов черновика
    const baseWeight =
        weightCheck && composition
            ? weightCheck.weight -
              regionCodesWeight(composition.regions, catalog)
            : null;
    const weightAfter =
        baseWeight === null
            ? null
            : Math.round((baseWeight + draftWeight(draft, catalog)) * 100) /
              100;

    return {
        rows,
        query,
        setQuery,
        filter,
        setFilter: (id: string) => setFilter(id as RegionsFilter),
        filters: REGIONS_FILTERS.map(item => ({
            id: item.id,
            label: item.label,
            count: counts[item.id],
            selected: item.id === filter,
        })),
        showAll,
        canToggleShowAll: hasPortalRegions(allRegions),
        toggleShowAll: () => setShowAll(prev => !prev),
        clientRegionCode,
        selectedCount: draftCodes(draft).length,
        weight: draftWeight(draft, catalog),
        /** Вес состава после сохранения против эталона комплекта; null — состав не открыт */
        complectWeight:
            weightAfter !== null && weightCheck && complect
                ? {
                      weight: weightAfter,
                      expected: weightCheck.expected,
                      fits: isWeightMatching(
                          weightAfter,
                          complect,
                          regionWeightSurplus(draft.counted, catalog),
                      ),
                  }
                : null,
        changed: isDraftChanged(draft, initial),
        toggleRegion: (code: string) =>
            setDraft(prev => toggleDraftRegion(prev, code)),
        setCounted: (code: string, counted: boolean) =>
            setDraft(prev => setDraftRegionCounted(prev, code, counted)),
        /** Блокирующее нарушение правил оставляет окно открытым: причина в messages.blocked */
        save: () => {
            if (editor.applyComposition(draftToAction(draft))) onClose();
        },
        blocked: editor.messages.blocked,
    };
};

export type RegionsEditorState = ReturnType<typeof useRegionsEditor>;
