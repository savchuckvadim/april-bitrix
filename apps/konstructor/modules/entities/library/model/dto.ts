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
export type LibraryItem = InnerDealLibraryItemDto;
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
