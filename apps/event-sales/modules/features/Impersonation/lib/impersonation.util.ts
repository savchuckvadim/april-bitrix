import type { BXUser } from '@workspace/bx';
// Прямой путь: барель режима руководителя тянет UI.
import { userFullName } from '@/modules/features/HeadMode/lib/head-mode.util';

/**
 * РЕЖИМ «РАБОТАТЬ КАК» — чистые правила (просьба владельца 28.10.2026).
 *
 * Суперпользователь April открывает «Звонки» от имени сотрудника: список
 * дел, правило «своей сделки», занятость дня и отчёт — всё как у
 * сотрудника. На портале следов нет; кто работал на самом деле, бэк
 * пишет только в свой журнал (поле `impersonatedBy` отчёта).
 */

/** Кто на самом деле открыл фрейм и за кого он работает. */
export interface ImpersonationSession {
    /** Суперпользователь — владелец фрейма; null — режима нет. */
    realUser: BXUser | null;
    /** Сотрудник, от имени которого работает приложение. */
    target: BXUser | null;
}

const toId = (raw: unknown): number => {
    const id = Number(raw);
    return Number.isInteger(id) && id > 0 ? id : 0;
};

/**
 * Под кем стартует приложение: под сотрудником, если режим включил тот
 * же человек, что открыл фрейм. Сменилась учётка — подмены нет: чужой
 * выбор не должен пережить вход другого человека.
 */
export const resolveBootUser = (
    authUser: BXUser,
    session: ImpersonationSession,
): BXUser => {
    const realId = toId(session.realUser?.ID);
    if (!session.target || !realId) return authUser;
    return toId(authUser?.ID) === realId ? session.target : authUser;
};

/** Что уходит в отчёт полем «кто работал на самом деле». */
export interface ImpersonatorPayload {
    ID: number;
    NAME?: string;
}

/** Поле отчёта; undefined — режима нет, отчёт обычный. */
export const buildImpersonator = (
    session: ImpersonationSession,
): ImpersonatorPayload | undefined => {
    if (!toId(session.target?.ID)) return undefined;
    const id = toId(session.realUser?.ID);
    if (!id) return undefined;
    return { ID: id, NAME: userFullName(session.realUser) };
};

/**
 * Можно ли включить режим: суперпользователь (флаг с бэка), режим ещё
 * не включён, сотрудник — не он сам.
 */
export const canImpersonate = (input: {
    isSuperUser: boolean;
    session: ImpersonationSession;
    myId: number;
    targetId: number;
}): boolean => {
    if (!input.isSuperUser || input.session.target) return false;
    const targetId = toId(input.targetId);
    return targetId > 0 && targetId !== toId(input.myId);
};
