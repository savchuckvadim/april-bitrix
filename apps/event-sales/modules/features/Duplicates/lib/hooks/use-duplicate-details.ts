'use client';

import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getDuplicateContext } from '@/modules/app/lib/utills/app-state-util';
import { reloadApp } from '@/modules/app/model/thunk/AppThunk';
import { selectMyDepartmentRole } from '@/modules/features/Departament/model/selectors';
import { duplicatesActions } from '../../model/DuplicatesSlice';
import { fetchDuplicateDetails, joinToMain } from '../../model/DuplicatesThunk';
import {
    DUPLICATE_ENTITY_TYPE,
    duplicateKey,
    type DuplicateCandidate,
} from '../../model';
import { buildCrmUrl, candidateTitle } from '../candidate-view';
import { JOIN_TO_MAIN_TEXT, resolveJoinTarget } from '../join-to-main.util';

/** Состояние и действия модалки подробностей по кандидату. */
export function useDuplicateDetails() {
    const dispatch = useAppDispatch();
    const domain = useAppSelector(s => s.app.domain);
    const candidates = useAppSelector(s => s.duplicates.candidates);
    const selectedKey = useAppSelector(s => s.duplicates.selectedKey);
    const status = useAppSelector(s => s.duplicates.detailsStatus);
    const error = useAppSelector(s => s.duplicates.detailsError);
    const details = useAppSelector(s => s.duplicates.details);

    const context = useAppSelector(getDuplicateContext);
    const role = useAppSelector(selectMyDepartmentRole).role;
    const joinArmed = useAppSelector(s => s.duplicates.joinArmed);
    const joinStatus = useAppSelector(s => s.duplicates.joinStatus);
    const joinError = useAppSelector(s => s.duplicates.joinError);
    const joinResult = useAppSelector(s => s.duplicates.joinResult);

    const candidate = candidates.find(
        (item: DuplicateCandidate) => duplicateKey(item) === selectedKey,
    );

    // Можно ли присоединить ТЕКУЩУЮ сделку к этому кандидату — чистое
    // правило (роль, откуда открыто, тип кандидата), компонент только рисует.
    const target = candidate
        ? resolveJoinTarget(candidate, context, role)
        : null;
    const confirmText =
        candidate && target?.targetType === 'company'
            ? JOIN_TO_MAIN_TEXT.confirmCompany(candidateTitle(candidate))
            : candidate
              ? JOIN_TO_MAIN_TEXT.confirmDeal(candidateTitle(candidate))
              : '';
    const mainDealUrl =
        domain && joinResult?.mainDealId
            ? buildCrmUrl(domain, DUPLICATE_ENTITY_TYPE.DEAL, joinResult.mainDealId)
            : null;

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
        join: {
            canJoin: !!target?.allowed,
            reason: target?.reason ?? null,
            confirmText,
            isArmed: joinArmed,
            isLoading: joinStatus === 'loading',
            isError: joinStatus === 'error',
            isReady: joinStatus === 'ready',
            error: joinError,
            result: joinResult,
            mainDealUrl,
            arm: () => dispatch(duplicatesActions.joinArmed({ armed: true })),
            disarm: () =>
                dispatch(duplicatesActions.joinArmed({ armed: false })),
            confirm: () => {
                if (candidate) dispatch(joinToMain(candidate));
            },
            reload: () => dispatch(reloadApp()),
        },
    };
}
