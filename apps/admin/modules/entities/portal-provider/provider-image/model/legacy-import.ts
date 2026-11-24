// Перенос картинок реквизитов из легаси. Формы описаны руками: ручка
// `POST /api/admin/portal/provider/images/legacy-import` ещё не попала в orval.
// После `pnpm run generate` интерфейсы заменяются алиасами на сгенерированные DTO.

import type { ProviderImageRole } from './types';

/** Результат по одной картинке (значения совпадают с бэком). */
export type ProviderImageLegacyStatus =
    | 'imported'
    | 'would-import'
    | 'exists'
    | 'already'
    | 'no-file'
    | 'skipped'
    | 'error';

/** Статусы в порядке, в котором итоги идут на экране: от нужного к проблемному. */
export const PROVIDER_IMAGE_LEGACY_STATUSES: readonly ProviderImageLegacyStatus[] = [
    'imported',
    'would-import',
    'already',
    'exists',
    'no-file',
    'skipped',
    'error',
];

/** Строка отчёта: одна картинка легаси и что с ней сделано (или будет сделано). */
export interface ProviderImageLegacyImportRow {
    /** Домен портала реквизитов; null, если портал не определён */
    portalDomain: string | null;
    rqId: number;
    rqName: string | null;
    /** Роль в новой системе; null, если легаси-запись не сопоставлена роли */
    role: ProviderImageRole | null;
    legacyFileId: number;
    /** Путь файла в легаси: по нему файл ищется среди выбранных */
    legacyPath: string;
    status: ProviderImageLegacyStatus;
    /** Пояснение бэка (причина отказа, что именно найдено) */
    message: string | null;
}

/** Итоги отчёта по статусам. */
export interface ProviderImageLegacyImportTotals {
    imported: number;
    wouldImport: number;
    exists: number;
    already: number;
    noFile: number;
    skipped: number;
    error: number;
}

/** Ответ ручки переноса. `dryRun: true` означает проверку: в базе ничего не менялось. */
export interface ProviderImageLegacyImportReport {
    dryRun: boolean;
    rows: ProviderImageLegacyImportRow[];
    totals: ProviderImageLegacyImportTotals;
}

/** Ключ статуса в итогах: `would-import` лежит в `wouldImport`, `no-file` в `noFile`. */
export const PROVIDER_IMAGE_LEGACY_TOTALS_KEY: Readonly<
    Record<ProviderImageLegacyStatus, keyof ProviderImageLegacyImportTotals>
> = {
    imported: 'imported',
    'would-import': 'wouldImport',
    exists: 'exists',
    already: 'already',
    'no-file': 'noFile',
    skipped: 'skipped',
    error: 'error',
};

/** Подписи статусов для таблицы отчёта. */
export const PROVIDER_IMAGE_LEGACY_STATUS_LABELS: Readonly<
    Record<ProviderImageLegacyStatus, string>
> = {
    imported: 'перенесена',
    'would-import': 'будет перенесена',
    exists: 'уже есть другая — не трогаем',
    already: 'уже перенесена',
    'no-file': 'файл не выбран',
    skipped: 'не переносится',
    error: 'ошибка',
};

/** Окраска статуса: UI подбирает под неё токены темы. */
export type ProviderImageLegacyTone = 'success' | 'info' | 'warning' | 'muted' | 'danger';

export const PROVIDER_IMAGE_LEGACY_STATUS_TONE: Readonly<
    Record<ProviderImageLegacyStatus, ProviderImageLegacyTone>
> = {
    imported: 'success',
    'would-import': 'info',
    exists: 'warning',
    already: 'muted',
    'no-file': 'warning',
    skipped: 'muted',
    error: 'danger',
};

/** Поле `multipart/form-data` с файлами (совпадает с бэком). */
export const PROVIDER_IMAGE_LEGACY_FIELD = 'files';

/** За один запрос бэк принимает не больше 100 файлов. */
export const PROVIDER_IMAGE_LEGACY_MAX_FILES = 100;

/** Расширения файлов, которые берём из выбранной папки. */
export const PROVIDER_IMAGE_LEGACY_EXTENSIONS: readonly string[] = ['png', 'jpg', 'jpeg'];

/** Перенос читает и пишет до сотни файлов: ждём дольше обычных 30 секунд админки. */
export const PROVIDER_IMAGE_LEGACY_TIMEOUT_MS = 5 * 60_000;
