import {
    PROVIDER_IMAGE_LEGACY_EXTENSIONS,
    PROVIDER_IMAGE_LEGACY_FIELD,
    PROVIDER_IMAGE_LEGACY_MAX_FILES,
    PROVIDER_IMAGE_LEGACY_TEXT,
} from '../model';

/** Файл с расширением png, jpg или jpeg; регистр не важен. */
export function isLegacyImportImage(file: Pick<File, 'name'>): boolean {
    const dot = file.name.lastIndexOf('.');
    if (dot < 0) return false;
    return PROVIDER_IMAGE_LEGACY_EXTENSIONS.includes(file.name.slice(dot + 1).toLowerCase());
}

/**
 * Имя файла для запроса: путь внутри выбранной папки (`папка/вложенная/файл.png`).
 * По нему бэк находит файл легаси. Без выбора папки остаётся имя файла.
 */
export function legacyImportFileName(file: Pick<File, 'name' | 'webkitRelativePath'>): string {
    return file.webkitRelativePath || file.name;
}

/** Что взято из выбранной папки. */
export interface LegacyImportSelection {
    /** Картинки PNG/JPG в порядке путей */
    files: File[];
    /** Сколько файлов папки отброшено как не картинки */
    skipped: number;
    /** Имя выбранной папки; null, если браузер не прислал пути */
    folder: string | null;
}

/** Отбор из выбранной папки: только png, jpg и jpeg, по порядку путей. */
export function selectLegacyImportFiles(picked: ArrayLike<File>): LegacyImportSelection {
    const all = Array.from(picked);
    const files = all
        .filter(isLegacyImportImage)
        .sort((a, b) => legacyImportFileName(a).localeCompare(legacyImportFileName(b)));
    const firstPath = all[0] ? legacyImportFileName(all[0]) : '';
    const folder = firstPath.includes('/') ? (firstPath.split('/')[0] ?? null) : null;
    return { files, skipped: all.length - files.length, folder };
}

/** Можно ли отправлять отбор: текст причины или null, если можно. */
export function checkLegacyImportSelection(
    selection: Pick<LegacyImportSelection, 'files'>,
): string | null {
    const count = selection.files.length;
    if (count === 0) return PROVIDER_IMAGE_LEGACY_TEXT.emptySelection;
    if (count > PROVIDER_IMAGE_LEGACY_MAX_FILES) {
        return PROVIDER_IMAGE_LEGACY_TEXT.tooMany(count, PROVIDER_IMAGE_LEGACY_MAX_FILES);
    }
    return null;
}

/** Тело запроса: каждый файл в поле `files` с именем-путём внутри папки. */
export function buildLegacyImportForm(files: readonly File[]): FormData {
    const form = new FormData();
    for (const file of files) {
        form.append(PROVIDER_IMAGE_LEGACY_FIELD, file, legacyImportFileName(file));
    }
    return form;
}
