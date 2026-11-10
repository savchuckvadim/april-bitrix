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

/**
 * Текст, который легаси-конструктор мог записать объектом поля ввода
 * (`{"value":""}`): достаём value, пустое — null.
 */
export const legacyText = (raw: string | null | undefined): string | null => {
    const text = raw?.trim();
    if (!text) return null;
    if (!text.startsWith('{')) return text;
    try {
        const parsed: unknown = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && 'value' in parsed) {
            const value = (parsed as { value: unknown }).value;
            return typeof value === 'string' && value.trim() ? value.trim() : null;
        }
    } catch {
        // не JSON — обычный текст со скобкой в начале
    }
    return text;
};

const createdLabel = (createdAt: string | null): string | null => {
    if (!createdAt) return null;
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString('ru-RU');
};

/** Подпись заготовки: своё название, иначе имя сделки-источника, иначе дата сохранения. */
export const libraryItemTitle = (
    item: Pick<LibraryItem, 'title' | 'dealName' | 'id' | 'createdAt'>,
): string => {
    const own = legacyText(item.title) ?? legacyText(item.dealName);
    if (own) return own;
    const created = createdLabel(item.createdAt);
    return created ? `Без названия · ${created}` : `Заготовка №${item.id}`;
};

/** «Из сделки: …» — только когда у заготовки своё название и сделка известна. */
export const libraryItemSource = (item: Pick<LibraryItem, 'title' | 'dealName'>): string | undefined => {
    const deal = legacyText(item.dealName);
    return deal && legacyText(item.title) ? `Из сделки: ${deal}` : undefined;
};

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
