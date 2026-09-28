import type {
    AiBrief,
    AiBriefBulletGroup,
} from '@/modules/entities/ai-analytics/model';
import { formatAiDay } from '@/modules/entities/ai-analytics/lib/ai-metric.util';
import { aiCardLink } from './ai-card-link.util';

/*
 * Вид карточки «Итоги периода»: заголовок, подпись периода со сравнением,
 * пункты по группам (что изменилось → на кого смотреть → что сделать) и
 * слово изменения вместо числа со знаком. Группу пункта называет сервер;
 * пункт без группы (итоги, собранные раньше) или с незнакомой группой
 * считаем изменением.
 */

export const AI_BRIEF_TITLE = 'Итоги периода: что изменилось и что сделать';

/** Подпись карточки, пока период отчёта не задан. */
export const AI_BRIEF_DESCRIPTION_FALLBACK =
    'Главные изменения за период и шаги на неделю';

export const AI_BRIEF_NO_SCOPE_TEXT =
    'Период отчёта не задан — итоги собрать не из чего.';

export const AI_BRIEF_NO_BULLETS_TEXT =
    'Отдельных пунктов за период не набралось — есть только главный вывод.';

export const AI_BRIEF_NO_COMPARISON_TEXT =
    'сравнения с прошлым периодом пока нет';

/** Сравнение есть, а даты прошлого периода сервер не назвал. */
export const AI_BRIEF_COMPARISON_TEXT = 'в сравнении с прошлым периодом';

/** Группа, в которую попадает пункт без группы или с незнакомой группой. */
export const AI_BRIEF_DEFAULT_GROUP: AiBriefBulletGroup = 'change';

/** Порядок групп на карточке и их заголовки. */
export const AI_BRIEF_GROUPS: readonly {
    group: AiBriefBulletGroup;
    title: string;
}[] = [
    { group: 'change', title: 'Что изменилось' },
    { group: 'focus', title: 'На кого смотреть' },
    { group: 'action', title: 'Что сделать на неделе' },
];

/** Слово изменения к прошлому периоду — вместо числа со знаком. */
export const AI_BRIEF_DELTA_WORDS = {
    more: 'больше',
    less: 'меньше',
    same: 'без изменений',
} as const;

/** Период карточки (YYYY-MM-DD); null — фильтр отчёта не задан. */
export interface AiBriefPeriod {
    from: string | null;
    to: string | null;
}

/** Сравнение из итогов; у итогов, собранных раньше, этих полей нет. */
export type AiBriefComparison = Partial<
    Pick<AiBrief, 'comparable' | 'previousPeriod'>
>;

/**
 * Пункт итогов, каким он мог прийти: у собранных раньше нет группы,
 * ссылки и изменения, а группа может оказаться незнакомой.
 */
export interface AiBriefBulletSource {
    text: string;
    group?: string | null;
    managerId?: string | null;
    callType?: string | null;
    link?: string | null;
    delta?: number | null;
}

/** Пункт к показу: всё необязательное приведено к значению либо null. */
export interface AiBriefBulletView {
    key: string;
    group: AiBriefBulletGroup;
    text: string;
    managerId: string | null;
    callType: string | null;
    /** Адрес карточки разбора; null — ссылки нет. */
    link: string | null;
    /** «больше» | «меньше» | «без изменений» — только у изменений с числом. */
    deltaWord: string | null;
}

export interface AiBriefGroupView {
    group: AiBriefBulletGroup;
    title: string;
    bullets: AiBriefBulletView[];
}

/** Группа пункта; нет или незнакомая — «что изменилось». */
export const resolveAiBriefGroup = (group: unknown): AiBriefBulletGroup =>
    AI_BRIEF_GROUPS.find(item => item.group === group)?.group ??
    AI_BRIEF_DEFAULT_GROUP;

/** Слово изменения по знаку; числа нет — null. */
export const aiBriefDeltaWord = (
    delta: number | null | undefined,
): string | null => {
    if (typeof delta !== 'number' || !Number.isFinite(delta)) return null;
    if (delta > 0) return AI_BRIEF_DELTA_WORDS.more;
    if (delta < 0) return AI_BRIEF_DELTA_WORDS.less;
    return AI_BRIEF_DELTA_WORDS.same;
};

const toBulletView = (
    bullet: AiBriefBulletSource,
    index: number,
): AiBriefBulletView => {
    const group = resolveAiBriefGroup(bullet.group);
    return {
        key: `${group}-${index}`,
        group,
        text: bullet.text.trim(),
        managerId: bullet.managerId || null,
        callType: bullet.callType || null,
        link: aiCardLink(bullet.link),
        deltaWord: group === 'change' ? aiBriefDeltaWord(bullet.delta) : null,
    };
};

/** Пункты по группам в порядке карточки; пустые группы и пустые пункты пропущены. */
export const buildAiBriefGroups = (
    bullets: readonly AiBriefBulletSource[] | null | undefined,
): AiBriefGroupView[] => {
    const views = (bullets ?? [])
        .map(toBulletView)
        .filter(bullet => bullet.text !== '');
    return AI_BRIEF_GROUPS.map(({ group, title }) => ({
        group,
        title,
        bullets: views.filter(bullet => bullet.group === group),
    })).filter(item => item.bullets.length > 0);
};

/**
 * Показывать ли менеджера чипом под текстом: в группе «На кого смотреть»
 * имя уже стоит над текстом пункта.
 */
export const showsAiBriefManagerChip = (
    bullet: Pick<AiBriefBulletView, 'group' | 'managerId'>,
): boolean => !!bullet.managerId && bullet.group !== 'focus';

/** Есть ли у пункта строка с чипами и ссылкой. */
export const hasAiBriefBulletMeta = (
    bullet: Pick<
        AiBriefBulletView,
        'group' | 'managerId' | 'callType' | 'link' | 'deltaWord'
    >,
): boolean =>
    !!bullet.deltaWord ||
    showsAiBriefManagerChip(bullet) ||
    !!bullet.callType ||
    !!bullet.link;

/** «в сравнении с 01.07–31.07» либо «сравнения с прошлым периодом пока нет». */
export const aiBriefComparisonText = (brief: AiBriefComparison): string => {
    if (!brief.comparable) return AI_BRIEF_NO_COMPARISON_TEXT;
    const previous = brief.previousPeriod;
    return previous?.from && previous.to
        ? `в сравнении с ${formatAiDay(previous.from)}–${formatAiDay(previous.to)}`
        : AI_BRIEF_COMPARISON_TEXT;
};

/**
 * Подпись карточки: период и сравнение. Итоги ещё собираются (brief нет) —
 * только период; период не задан — общая подпись.
 */
export const aiBriefDescription = (
    period: AiBriefPeriod,
    brief: AiBriefComparison | null | undefined,
): string => {
    if (!period.from || !period.to) return AI_BRIEF_DESCRIPTION_FALLBACK;
    const range = `${formatAiDay(period.from)} – ${formatAiDay(period.to)}`;
    return brief ? `${range}, ${aiBriefComparisonText(brief)}` : range;
};
