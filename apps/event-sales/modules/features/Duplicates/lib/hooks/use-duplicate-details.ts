'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { duplicatesActions } from '../../model/DuplicatesSlice';
import { fetchDuplicateDetails } from '../../model/DuplicatesThunk';
import { duplicateKey, type DuplicateCandidate } from '../../model';

/** Состояние и действия модалки подробностей по кандидату. */
export function useDuplicateDetails() {
    const dispatch = useAppDispatch();
    const domain = useAppSelector(s => s.app.domain);
    const candidates = useAppSelector(s => s.duplicates.candidates);
    const selectedKey = useAppSelector(s => s.duplicates.selectedKey);
    const status = useAppSelector(s => s.duplicates.detailsStatus);
    const error = useAppSelector(s => s.duplicates.detailsError);
    const details = useAppSelector(s => s.duplicates.details);

    const candidate = candidates.find(
        (item: DuplicateCandidate) => duplicateKey(item) === selectedKey,
    );

    return {
        domain,
        candidate,
        details,
        error,
        isOpen: !!selectedKey,
        isLoading: status === 'loading',
        isError: status === 'error',
        isReady: status === 'ready',
        close: () => dispatch(duplicatesActions.detailsClosed()),
        retry: () => {
            if (candidate) dispatch(fetchDuplicateDetails(candidate));
        },
    };
}
