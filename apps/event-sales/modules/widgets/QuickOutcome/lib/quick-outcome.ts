import type { BXUser } from '@workspace/bx';
import type { ClientContext } from '@/modules/app/lib/utills/app-state-util';
import type { WorkStatusCode } from '@/modules/entities/EventReport/type/event-report-type';
import {
    type ActingManagerPayload,
    userFullName,
} from '@/modules/features/HeadMode/lib/head-mode.util';

/**
 * «Продажа» и «Отказ» кнопками рядом с «создать» (владелец, 05.10.2026).
 *
 * Итог по клиенту записывается одним действием, без открытия дела: кнопка →
 * окно → обычная отправка отчёта «Звонков» (тот же поток, что у формы: стадия
 * сделки, история, показатели). Здесь — правила этих кнопок, без React и
 * без стора.
 */
export const QUICK_OUTCOME = {
    sale: 'sale',
    fail: 'fail',
} as const;

export type QuickOutcomeKind =
    (typeof QUICK_OUTCOME)[keyof typeof QUICK_OUTCOME];

/** Каким статусом работы уезжает итог. */
export const QUICK_OUTCOME_WORK_STATUS: Record<
    QuickOutcomeKind,
    WorkStatusCode
> = {
    [QUICK_OUTCOME.sale]: 'success',
    [QUICK_OUTCOME.fail]: 'fail',
};

/** Что произойдёт после отправки — одна фраза на оба окна. */
const OUTCOME_DESCRIPTION =
    'Запишется обычным отчётом: стадия сделки, история и показатели — как при отчёте по делу.';

export interface QuickOutcomeText {
    button: string;
    title: string;
    description: string;
    commentPlaceholder: string;
    submit: string;
}

/** Тексты кнопок и окон — в одном месте, не в вёрстке. */
export const QUICK_OUTCOME_TEXT: Record<QuickOutcomeKind, QuickOutcomeText> = {
    [QUICK_OUTCOME.sale]: {
        button: 'продажа',
        title: 'Продажа',
        description: OUTCOME_DESCRIPTION,
        commentPlaceholder: 'Что купили и на каких условиях?',
        submit: 'Записать продажу',
    },
    [QUICK_OUTCOME.fail]: {
        button: 'отказ',
        title: 'Отказ',
        description: OUTCOME_DESCRIPTION,
        commentPlaceholder: 'Почему клиент отказался?',
        submit: 'Записать отказ',
    },
};

const toId = (raw: unknown): number => {
    const id = Number(raw);
    return Number.isFinite(id) && id > 0 ? id : 0;
};

/**
 * На кого записать итог: ответственный сделки контекста.
 *
 * Требование владельца: продажа и отказ засчитываются тому, кто ведёт
 * сделку, а не тому, кто нажал кнопку. Сделки в контексте нет или
 * ответственный не указан — итог записывается на самого пользователя.
 */
export const resolveOutcomeOwnerId = (input: {
    dealAssignedById: unknown;
    myId: number;
}): number => toId(input.dealAssignedById) || input.myId;

/**
 * Пометка «кто записал итог за ответственного» — тем же полем отчёта, что
 * у режима руководителя. Итог за самого себя пометки не несёт.
 */
export const buildQuickOutcomeSender = (input: {
    /** Идёт быстрый итог — вне его пометки нет. */
    isActive: boolean;
    me: BXUser | null;
    /** На кого записывается отчёт. */
    ownerId: number;
}): ActingManagerPayload | undefined => {
    const myId = toId(input.me?.ID);
    if (!input.isActive || !myId) return undefined;
    if (!input.ownerId || input.ownerId === myId) return undefined;
    return { ID: myId, NAME: userFullName(input.me) };
};

/**
 * Подсказка в окне, когда итог записывается не на нажавшего кнопку.
 * Имя неизвестно — говорим без него: номер сотрудника человеку ни о чём.
 */
export const getOutcomeOwnerNote = (ownerName: string): string => {
    const owner = ownerName.trim();
    const whom = owner
        ? `Запишется на ответственного сделки — ${owner}.`
        : 'Запишется на ответственного сделки.';
    return `${whom} В истории будет видно, что отчёт отправили вы.`;
};

/**
 * Почему «Продажа» в сделке без компании серая: продать без компании
 * нельзя (сделка продажи и её привязки без неё не создаются) — компанию надо
 * добавить в сделку (владелец, 06.10.2026).
 */
export const SALE_NEEDS_COMPANY_HINT = 'Добавьте компанию в сделку';

/** Кнопка итога: какая и, если недоступна, — почему (кнопка серая с подсказкой). */
export interface QuickOutcomeButtonState {
    kind: QuickOutcomeKind;
    blockedHint?: string;
}

/**
 * Какие кнопки показать.
 *
 *  - на экране дела кнопок нет: там открыта форма, и итог ставится в ней;
 *  - «Продажа» — только при компании: в сделке без компании она видна, но
 *    серая с подсказкой «Добавьте компанию в сделку»; по лиду её нет; у ТМЦ
 *    статуса «Продажа» нет вовсе;
 *  - «Отказ» — везде, где есть клиент.
 */
export const getQuickOutcomeButtons = (input: {
    isItemScreen: boolean;
    context: ClientContext;
    isTmc: boolean;
}): QuickOutcomeButtonState[] => {
    if (input.isItemScreen || input.context === 'unknown') return [];
    const fail: QuickOutcomeButtonState = { kind: QUICK_OUTCOME.fail };
    if (input.isTmc) return [fail];
    if (input.context === 'company') {
        return [{ kind: QUICK_OUTCOME.sale }, fail];
    }
    if (input.context === 'dealNoCompany') {
        return [
            { kind: QUICK_OUTCOME.sale, blockedHint: SALE_NEEDS_COMPANY_HINT },
            fail,
        ];
    }
    return [fail];
};
