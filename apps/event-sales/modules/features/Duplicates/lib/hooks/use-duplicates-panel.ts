'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { duplicatesActions } from '../../model/DuplicatesSlice';
import {
    deepSearchDuplicates,
    fetchDuplicateDetails,
    searchDuplicates,
} from '../../model/DuplicatesThunk';
import type { DuplicateCandidate } from '../../model';
import { isOwnCandidate, resolveDuplicateTarget } from '../duplicate-context';

/**
 * Состояние и действия ленты «Сигналы».
 *
 * Компонент из этого хука получает готовые флаги и колбэки и только рисует —
 * ни селекторов, ни условий в вёрстке.
 */
export function useDuplicatesPanel() {
    const dispatch = useAppDispatch();
    const status = useAppSelector(s => s.duplicates.status);
    const error = useAppSelector(s => s.duplicates.error);
    const isAuto = useAppSelector(s => s.duplicates.isAuto);
    const allCandidates = useAppSelector(s => s.duplicates.candidates);
    const isManualOpen = useAppSelector(s => s.duplicates.isManualOpen);
    const context = useAppSelector(getDuplicateContext);

    const target = resolveDuplicateTarget(context);
    const isLoading = status === 'loading';
    // Сама текущая сущность — не дубль (см. isOwnCandidate).
    const candidates = allCandidates.filter(
        candidate => !isOwnCandidate(candidate, context),
    );

    return {
        candidates,
        isLoading,
        isManualOpen,
        /** Подпись «по кому ищем» — из правил контекста, не из вёрстки. */
        targetLabel: target.label,
        hasCandidates: candidates.length > 0,
        /**
         * Ошибку автопоиска не показываем: он срабатывает сам при открытии, и
         * его сбой не должен мешать заполнять отчёт.
         */
        showError: status === 'error' && !isAuto,
        /** Поиск отработал и ничего не нашёл — это отдельное сообщение. */
        isSearched: status === 'ready',
        error,
        search: () => dispatch(searchDuplicates({ force: true })),
        searchDeeper: () => dispatch(deepSearchDuplicates()),
        openDetails: (candidate: DuplicateCandidate) =>
            dispatch(fetchDuplicateDetails(candidate)),
        toggleManual: () =>
            dispatch(
                duplicatesActions.manualToggled({ isOpen: !isManualOpen }),
            ),
    };
}
