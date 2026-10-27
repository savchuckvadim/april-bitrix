import type { BadgeItem, BadgeTarget } from '../model';

/**
 * Чистые операции над черновиком набора — без React и без сети, чтобы
 * проверять тестами. Черновик — это `items` формы; сохраняется целиком.
 */

const SORT_STEP = 10;

/** Код нового бейджика: `own_<n>`, где n — первый свободный номер. */
export const nextBadgeCode = (items: readonly BadgeItem[]): string => {
    const taken = new Set(items.map(item => item.code));
    let n = items.length + 1;
    while (taken.has(`own_${n}`)) n += 1;
    return `own_${n}`;
};

/** Пустой бейджик нужной цели в конец своей группы. */
export const newBadge = (
    items: readonly BadgeItem[],
    target: BadgeTarget,
): BadgeItem => {
    const group = items.filter(item => item.target === target);
    const maxSort = group.reduce((max, item) => Math.max(max, item.sort), 0);
    return {
        code: nextBadgeCode(items),
        text: '',
        target,
        tone: target === 'title' ? 'neutral' : 'info',
        outcomes: [],
        planTypes: [],
        isDefault: false,
        sort: maxSort + SORT_STEP,
        isActive: true,
    };
};

export const updateBadge = (
    items: readonly BadgeItem[],
    code: string,
    patch: Partial<BadgeItem>,
): BadgeItem[] =>
    items.map(item => (item.code === code ? { ...item, ...patch } : item));

export const removeBadge = (items: readonly BadgeItem[], code: string): BadgeItem[] =>
    items.filter(item => item.code !== code);

/** Переключить привязку (итог или тип) в списке бейджика. */
export const toggleInList = <Value extends string>(
    values: readonly Value[],
    value: Value,
): Value[] =>
    values.includes(value)
        ? values.filter(item => item !== value)
        : [...values, value];

/**
 * Сдвинуть бейджик внутри своей группы (цели) вверх или вниз; `sort`
 * пересчитывается шагом, чтобы порядок был устойчивым.
 */
export const moveBadge = (
    items: readonly BadgeItem[],
    code: string,
    direction: 'up' | 'down',
): BadgeItem[] => {
    const current = items.find(item => item.code === code);
    if (!current) return [...items];
    const group = sortedGroup(items, current.target);
    const index = group.findIndex(item => item.code === code);
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= group.length) return [...items];

    const moving = group[index];
    const other = group[swapWith];
    if (!moving || !other) return [...items];
    const reordered = [...group];
    reordered[index] = other;
    reordered[swapWith] = moving;
    const sortByCode = new Map(
        reordered.map((item, position) => [item.code, (position + 1) * SORT_STEP]),
    );
    return items.map(item => {
        const sort = sortByCode.get(item.code);
        return sort === undefined ? item : { ...item, sort };
    });
};

/** Группа одной цели в порядке показа. */
export const sortedGroup = (
    items: readonly BadgeItem[],
    target: BadgeTarget,
): BadgeItem[] =>
    items
        .filter(item => item.target === target)
        .sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));

/** Копия общего набора как заготовка своего. */
export const copyDefaults = (defaults: readonly BadgeItem[]): BadgeItem[] =>
    defaults.map(item => ({
        ...item,
        outcomes: [...item.outcomes],
        planTypes: [...item.planTypes],
    }));

/**
 * Что бэк не примет — показать до нажатия «Сохранить». Повторяет правила
 * сохранения на бэке в той части, которую видно по форме: пустой текст,
 * повтор кода, два основных на один тип. Остальное (реестры) форма не даёт
 * нарушить сама.
 */
export const findDraftIssues = (items: readonly BadgeItem[]): string[] => {
    const issues: string[] = [];
    const codes = new Set<string>();
    const defaultByType = new Map<string, string>();

    items.forEach((item, index) => {
        const label = item.text.trim() ? `«${item.text.trim()}»` : `бейджик №${index + 1}`;
        if (!item.text.trim()) issues.push(`${label}: текст не заполнен`);
        if (codes.has(item.code)) issues.push(`${label}: код «${item.code}» повторяется`);
        codes.add(item.code);
        if (item.isDefault && item.isActive) {
            for (const planType of item.planTypes) {
                const taken = defaultByType.get(planType);
                if (taken) {
                    issues.push(
                        `${label}: у типа «${planType}» уже есть основной бейджик ${taken}`,
                    );
                }
                defaultByType.set(planType, label);
            }
        }
    });
    return issues;
};

/** Одинаковы ли два набора по содержанию (для признака «есть правки»). */
export const sameBadges = (
    a: readonly BadgeItem[],
    b: readonly BadgeItem[],
): boolean => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));

const normalize = (items: readonly BadgeItem[]) =>
    [...items]
        .sort((x, y) => x.code.localeCompare(y.code))
        .map(item => ({
            ...item,
            text: item.text.trim(),
            outcomes: [...item.outcomes].sort(),
            planTypes: [...item.planTypes].sort(),
        }));
