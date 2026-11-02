import {
    CHECKPOINT_CODE_PATTERN,
    METHODOLOGY_CODE_PATTERN,
    type CatalogCheckpoint,
    type CatalogEntry,
    type MethodologyCap,
    type MethodologyCatalog,
    type MethodologyCheckpoint,
    type MethodologyCondition,
    type MethodologyConfig,
    type MethodologyDetail,
} from '../model';

/** Пустой конфиг новой методики. */
export const emptyConfig = (code = '', title = ''): MethodologyConfig => ({
    code,
    title,
    version: '1.0.0',
    types: [],
    principles: [],
    checkpoints: [],
    caps: [],
    spirals: { enabled: false, minFull: 0, types: [] },
});

/** Копия конфига методики как своей: новый код и название, версия с нуля. */
export const copyConfig = (
    source: MethodologyConfig,
    code: string,
    title: string,
): MethodologyConfig => ({
    ...JSON.parse(JSON.stringify(source)) as MethodologyConfig,
    code,
    title,
    version: '1.0.0',
});

/** «1.2.3» → «1.2.4»; не разобрать — «1.0.0». */
export const bumpVersion = (version: string): string => {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version.trim());
    if (!match) return '1.0.0';
    return `${match[1]}.${match[2]}.${Number(match[3]) + 1}`;
};

/** Код из названия: транслит кириллицы, латиница и цифры, дефисы. */
export const suggestCode = (title: string): string => {
    const map: Record<string, string> = {
        а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
        к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
        х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    };
    const latin = title
        .toLowerCase()
        .split('')
        .map(char => map[char] ?? char)
        .join('')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 64);
    return /^[a-z]/.test(latin) ? latin : latin ? `m-${latin}`.slice(0, 64) : '';
};

export const isValidMethodologyCode = (code: string): boolean =>
    METHODOLOGY_CODE_PATTERN.test(code);
export const isValidCheckpointCode = (code: string): boolean =>
    CHECKPOINT_CODE_PATTERN.test(code);

/** Подпись записи каталога по коду; неизвестный код — как есть. */
export const catalogTitle = (
    entries: readonly CatalogEntry[] | undefined,
    code: string,
): string => entries?.find(entry => entry.code === code)?.title ?? code;

/** Условие словами: «Потребности выявлены равно false», «пункт пропущен: Резюмировал…». */
export const conditionText = (
    condition: MethodologyCondition,
    catalog: MethodologyCatalog | undefined,
    checkpoints: readonly MethodologyCheckpoint[],
): string => {
    const op = catalogTitle(catalog?.conditionOps, condition.op);
    if (condition.op === 'checkpoint_missed' || condition.op === 'checkpoint_done') {
        const checkpoint = checkpoints.find(item => item.code === condition.checkpoint);
        return `${op}: ${checkpoint?.title ?? condition.checkpoint ?? '—'}`;
    }
    const field = condition.field
        ? catalogTitle(catalog?.factFields, condition.field)
        : '—';
    const needsValue = ['is', 'not', 'lt', 'lte', 'gt', 'gte'].includes(condition.op);
    return needsValue
        ? `${field} ${op} ${String(condition.value ?? 'пусто')}`
        : `${field}: ${op}`;
};

/** Ограничитель словами для таблицы. */
export const capText = (
    cap: MethodologyCap,
    catalog: MethodologyCatalog | undefined,
): string =>
    `${catalogTitle(catalog?.capTargets, cap.target)} не выше ${cap.max}`;

/** Новый пустой пункт с уникальным кодом в методике. */
export const newCheckpoint = (
    existing: readonly MethodologyCheckpoint[],
    types: string[],
): MethodologyCheckpoint => ({
    code: uniqueCode('own.point', existing.map(item => item.code)),
    title: '',
    types: [...types],
    evidence: 'quote',
    mandatory: true,
});

/** Новый пустой ограничитель. */
export const newCap = (existing: readonly MethodologyCap[]): MethodologyCap => ({
    code: uniqueCode('own.cap', existing.map(item => item.code)),
    title: '',
    when: [{ op: 'is', field: 'needsFound', value: false }],
    target: 'total',
    max: 7,
});

/** Пустое условие. */
export const newCondition = (): MethodologyCondition => ({
    op: 'is',
    field: 'needsFound',
    value: false,
});

/** Код с числовым хвостом, которого ещё нет в списке. */
export const uniqueCode = (base: string, taken: readonly string[]): string => {
    if (!taken.includes(base)) return base;
    let index = 2;
    while (taken.includes(`${base}_${index}`)) index += 1;
    return `${base}_${index}`;
};

/** Значение условия из текстового поля: true/false, число, иначе строка; пусто — null. */
export const parseConditionValue = (
    raw: string,
): MethodologyCondition['value'] => {
    const text = raw.trim();
    if (text === '') return null;
    if (text === 'true') return true;
    if (text === 'false') return false;
    const number = Number(text.replace(',', '.'));
    return Number.isFinite(number) && /^-?\d+([.,]\d+)?$/.test(text) ? number : text;
};

/** Значение условия в текстовое поле. */
export const conditionValueText = (value: MethodologyCondition['value']): string =>
    value === null || value === undefined ? '' : String(value);

/** Состояние строки списка словами. */
export const itemStateLabel = (
    item: Pick<MethodologyDetail, 'source' | 'isActive' | 'valid'>,
    texts: { builtin: string; inactive: string; invalid: string },
): string[] => {
    const labels: string[] = [];
    if (item.source === 'builtin') labels.push(texts.builtin);
    if (!item.isActive) labels.push(texts.inactive);
    if (!item.valid) labels.push(texts.invalid);
    return labels;
};

/** JSON формы → конфиг; ошибка разбора — текст. */
export const parseConfigJson = (
    text: string,
): { config: MethodologyConfig | null; error: string | null } => {
    try {
        const parsed: unknown = JSON.parse(text);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return { config: null, error: 'Ожидается объект конфига' };
        }
        return { config: parsed as MethodologyConfig, error: null };
    } catch (error) {
        return { config: null, error: (error as Error).message };
    }
};

export const configToJson = (config: MethodologyConfig): string =>
    JSON.stringify(config, null, 2);

/** Переключить код в списке (типы звонков). */
export const toggleInList = (list: readonly string[], code: string): string[] =>
    list.includes(code) ? list.filter(item => item !== code) : [...list, code];

/** Пункт каталога → свой пункт методики: только типы, которые есть у методики. */
export const fromCatalogCheckpoint = (
    item: CatalogCheckpoint,
    methodologyTypes: readonly string[],
): MethodologyCheckpoint => ({
    code: item.code,
    title: item.title,
    types: item.types.filter(type => methodologyTypes.includes(type)),
    evidence: item.evidence,
    mandatory: item.mandatory,
    ...(item.hint !== undefined ? { hint: item.hint } : {}),
    ...(item.product !== undefined ? { product: item.product } : {}),
    ...(item.rule !== undefined ? { rule: item.rule } : {}),
});
