import { createSelector } from '@reduxjs/toolkit';
import type { BXUser } from '@workspace/bx';
import type { RootState } from '@/modules/app/model/store';
import {
    ImpersonationSession,
    ImpersonatorPayload,
    buildImpersonator,
} from '../lib/impersonation.util';

export const selectImpersonation = (state: RootState): ImpersonationSession =>
    state.impersonation;

/** Сотрудник, от имени которого работает приложение; null — режима нет. */
export const selectImpersonationTarget = (state: RootState): BXUser | null =>
    state.impersonation.target;

/** Поле отчёта «кто работал на самом деле»; undefined — режима нет. */
export const selectImpersonator = createSelector(
    [selectImpersonation],
    (session): ImpersonatorPayload | undefined => buildImpersonator(session),
);
