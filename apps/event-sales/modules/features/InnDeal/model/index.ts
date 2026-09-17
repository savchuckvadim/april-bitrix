/**
 * Типы вкладки «ИНН» карточки сделки.
 *
 * Ручки (`GET /api/inn/deal/{dealId}`, `POST …/choose`, `POST …/hide`) ещё
 * не прошли через orval: генерация требует поднятого бэка, а он в момент
 * работы над вкладкой был только в рабочем дереве. По правилу репозитория
 * (CLAUDE.md, «Если ручка ещё не попала в orval») формы описаны здесь
 * руками — ИМЕНАМИ БУДУЩИХ DTO, а запрос идёт тем же транспортом
 * `customAxios`. После `pnpm run generate` правка сведётся к замене этих
 * объявлений на импорт из `@workspace/nest-event-sales-api`.
 *
 * Модель истины (бэк, ai/tasks/2026-09-17-inn-strategy.md): текущий ИНН —
 * это пара «договор ↔ плательщик», поэтому он живёт на СДЕЛКЕ. Пул
 * вариантов только пополняется, решение принимает человек.
 */

/** Откуда пришло значение ИНН. */
export type InnSourceKind =
    | 'company_requisite'
    | 'contact_requisite'
    | 'manual'
    | 'deal_field'
    | 'deal_pool'
    | 'company_field'
    | 'lead_field'
    | 'title';

/** Сила кандидата: `weak` — найден только в названии, доверия мало. */
export type InnStrength = 'strong' | 'normal' | 'weak';

/** Происхождение текущего ИНН договора. */
export type InnOrigin = 'requisite' | 'manual' | 'auto' | 'unknown' | 'none';

/** Вид расхождения, которое показывается плашкой. */
export type InnConflictKind =
    | 'not_chosen'
    | 'requisite_mismatch'
    | 'inn_without_requisite'
    | 'inn_other_company'
    | 'requisite_foreign'
    | 'fields_missing'
    | 'requisites_denied';

export type InnConflictLevel = 'info' | 'warning' | 'error';

export interface InnCandidateSource {
    kind: InnSourceKind;
    /** Готовая подпись с бэка: «из реквизита компании «Ромашка»». */
    label: string;
    entityId?: number;
}

export interface InnCandidate {
    inn: string;
    /** Разрядность: 10 — юрлицо, 12 — ИП или физлицо. */
    digits: number;
    strength: InnStrength;
    label: string;
    sources: InnCandidateSource[];
    inPool: boolean;
    isCurrent: boolean;
    hidden: boolean;
}

export interface InnRequisiteCard {
    id: number;
    ownerType: 'company' | 'contact';
    ownerId: number;
    ownerTitle: string;
    name: string;
    presetId: number;
    presetName: string;
    inn: string;
    kpp: string;
    companyName: string;
    /** Реквизит привязан к сделке — по нему уйдут счёт и печатные формы. */
    linked: boolean;
    /** Другие сделки с тем же реквизитом: две пары реквизитов — норма. */
    otherDealIds: number[];
}

export interface InnConflict {
    kind: InnConflictKind;
    level: InnConflictLevel;
    /** Готовый текст плашки на русском — фронт его не сочиняет. */
    message: string;
    inn?: string;
    entityIds?: number[];
}

export interface InnCurrent {
    inn: string;
    digits: number;
    origin: InnOrigin;
    userName?: string;
    at?: string;
    requisiteId?: number;
    /** Проставлено догоном при нескольких вариантах — нужно подтверждение. */
    unverified: boolean;
}

export interface InnAvailability {
    dealInnField: boolean;
    dealPoolField: boolean;
    companyInnField: boolean;
    companyPoolField: boolean;
    requisitesReadable: boolean;
}

export interface InnSnapshot {
    dealId: number;
    domain: string;
    /** Сделка закрыта — только чтение. */
    readOnly: boolean;
    /** Хеш состояния: возвращается в выбор, защищает от гонки. */
    version: string;
    current: InnCurrent | null;
    candidates: InnCandidate[];
    requisites: InnRequisiteCard[];
    conflicts: InnConflict[];
    availability: InnAvailability;
    warnings: string[];
}

export interface InnChooseRequest {
    domain: string;
    inn: string;
    version: string;
    userId?: number;
}

export interface InnHideRequest {
    domain: string;
    inn: string;
    userId?: number;
    /** true — вернуть ранее скрытый вариант в список. */
    restore?: boolean;
}
