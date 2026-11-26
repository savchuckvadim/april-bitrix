import { formatRub } from '@/modules/shared/lib/money';
import { pluralRu } from '@/modules/shared/lib/plural';
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

const trimmed = (raw: string | null | undefined): string | null => raw?.trim() || null;

type TitleSource = Pick<LibraryItem, 'title' | 'dealName' | 'id' | 'createdAt' | 'summary'>;

/** Подпись и признак «дата сохранения уже стоит в подписи». */
const resolveTitle = (item: TitleSource): { text: string; hasDate: boolean } => {
    const named =
        legacyText(item.title) ?? legacyText(item.dealName) ?? trimmed(item.summary?.complect);
    if (named) return { text: named, hasDate: false };
    const created = createdLabel(item.createdAt);
    return created
        ? { text: `Без названия · ${created}`, hasDate: true }
        : { text: `Заготовка №${item.id}`, hasDate: false };
};

/**
 * Подпись заготовки: своё название, иначе имя сделки-источника, иначе комплект
 * из состава («Гарант-Юрист»), иначе дата сохранения.
 */
export const libraryItemTitle = (item: TitleSource): string => resolveTitle(item).text;

/**
 * Строка состава: «Интернет 1 ОД · Лицензионный полгода · 27 200 ₽ · + ещё 2 позиции».
 * Пустые части пропускаются; без состава (старый бэк) строки нет.
 */
export const libraryItemComposition = (item: Pick<LibraryItem, 'summary'>): string | null => {
    const summary = item.summary;
    if (!summary) return null;
    const sum = typeof summary.sum === 'number' && Number.isFinite(summary.sum) ? formatRub(summary.sum) : null;
    const more =
        Number.isFinite(summary.rowsCount) && summary.rowsCount > 1
            ? `+ ещё ${summary.rowsCount - 1} ${pluralRu(summary.rowsCount - 1, ['позиция', 'позиции', 'позиций'])}`
            : null;
    const parts = [trimmed(summary.supply), trimmed(summary.contract), sum, more];
    return parts.filter((part): part is string => Boolean(part)).join(' · ') || null;
};

/** «Сохранено 12.03.2025» — когда даты ещё нет в подписи карточки. */
export const libraryItemSavedLabel = (item: TitleSource): string | null => {
    if (resolveTitle(item).hasDate) return null;
    const created = createdLabel(item.createdAt);
    return created ? `Сохранено ${created}` : null;
};

/** «Из сделки: …» — только когда у заготовки своё название и сделка известна. */
export const libraryItemSource = (item: Pick<LibraryItem, 'title' | 'dealName'>): string | undefined => {
    const deal = legacyText(item.dealName);
    return deal && legacyText(item.title) ? `Из сделки: ${deal}` : undefined;
};

/**
 * Строки под заголовком карточки: состав, «Из сделки: …», затем «Сохранено …»
 * и автор чужой заготовки. Дата сохранения идёт вместе с составом: без него
 * (старый бэк) карточка выглядит как раньше.
 */
export const libraryItemMetaLines = (item: TitleSource, authorLabel?: string): string[] => {
    const composition = libraryItemComposition(item);
    const footer = [composition ? libraryItemSavedLabel(item) : null, authorLabel]
        .filter((part): part is string => Boolean(part))
        .join(' · ');
    return [composition, libraryItemSource(item), footer || null].filter((line): line is string =>
        Boolean(line),
    );
};

export type LibraryScopeFilter ='all' | 'own' | 'department' | 'portal';

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
