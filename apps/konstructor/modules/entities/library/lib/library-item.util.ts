import type { SnapshotRecordDto } from '../../snapshot/model/dto';
import type { LibraryItem, LibraryKind, LibraryVisibility } from '../model/dto';

/** Строка списка из только что созданной записи (бэк отдаёт полный слепок). */
export const toLibraryItem = (
    record: SnapshotRecordDto,
    meta: { kind: LibraryKind; visibility: LibraryVisibility; title: string },
    authorId: number,
): LibraryItem => ({
    id: record.id,
    kind: meta.kind,
    visibility: meta.visibility,
    title: meta.title,
    dealName: record.dealName,
    authorId,
    departmentId: null,
    canEdit: true,
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: null,
});

/** Подпись заготовки: своё название, иначе имя сделки-источника (легаси-избранное). */
export const libraryItemTitle = (item: Pick<LibraryItem, 'title' | 'dealName' | 'id'>): string =>
    item.title?.trim() || item.dealName?.trim() || `Заготовка №${item.id}`;

export type LibraryScopeFilter = 'all' | 'own' | 'department' | 'portal';

/** Фильтр экрана «своё / отдел / портал / все». */
export const filterLibraryItems = (
    items: LibraryItem[],
    kind: LibraryKind,
    scope: LibraryScopeFilter,
    userId: number | null,
): LibraryItem[] =>
    items
        .filter(item => item.kind === kind)
        .filter(item => {
            switch (scope) {
                case 'own':
                    return item.authorId === userId;
                case 'department':
                    return item.visibility === 'department';
                case 'portal':
                    return item.visibility === 'portal' || item.visibility === 'global';
                default:
                    return true;
            }
        });
