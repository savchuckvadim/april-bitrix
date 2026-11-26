import type {
    InnerDealLibraryCreateDto,
    InnerDealLibraryItemDto,
    InnerDealLibraryItemDtoKind,
    InnerDealLibraryItemDtoVisibility,
    InnerDealLibraryPatchDto,
    InnerDealLibraryRightsDto,
    InnerDealLibrarySnapshotDto,
} from '@workspace/nest-konstructor-api';

/**
 * Библиотека заготовок (избранное + акции) — алиасы generated DTO
 * (паттерн CLAUDE.md): UI/thunks используют только их.
 */

/**
 * Состав заготовки для карточки. Бэк присылает его в каждом элементе списка;
 * сгенерированный клиент поля ещё не знает, поэтому форма описана здесь по
 * образцу репо (после `pnpm run generate` останется сменить импорт).
 * Старый бэк поля не отдаёт — везде работаем с `undefined`.
 */
export interface LibraryItemSummary {
    /** Комплект: «Гарант-Юрист» */
    complect: string | null;
    /** Поставка: «Интернет 1 ОД» */
    supply: string | null;
    /** Договор: «Лицензионный полгода» */
    contract: string | null;
    /** Итог общего набора, ₽ */
    sum: number | null;
    /** Строк в общем наборе */
    rowsCount: number;
}

export type LibraryItem = InnerDealLibraryItemDto & {
    summary?: LibraryItemSummary | null;
};
export type LibraryKind = InnerDealLibraryItemDtoKind;
export type LibraryVisibility = InnerDealLibraryItemDtoVisibility;
export type LibraryRights = InnerDealLibraryRightsDto;
export type LibraryCreateDto = InnerDealLibraryCreateDto;
export type LibraryPatchDto = InnerDealLibraryPatchDto;
export type LibrarySnapshotPayload = InnerDealLibrarySnapshotDto;

export const LIBRARY_KIND = {
    FAVORITE: 'favorite',
    PROMOTION: 'promotion',
} as const satisfies Record<string, LibraryKind>;

export const LIBRARY_VISIBILITY_TITLE: Record<LibraryVisibility, string> = {
    user: 'Только мне',
    department: 'Моему отделу',
    portal: 'Всему порталу',
    global: 'Всем порталам',
};

export const LIBRARY_KIND_TITLE: Record<LibraryKind, { one: string; many: string }> = {
    favorite: { one: 'избранное', many: 'Избранное' },
    promotion: { one: 'акция', many: 'Акции' },
};
