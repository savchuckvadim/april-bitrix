import type {
    PortalViewBadgeOption,
    PortalViewMethodology,
} from '@/modules/feature/portal-view';
// Прямой путь, не барель сущности: нужна одна чистая функция подписи типа.
import {
    AI_CALL_TYPE_LABELS,
    aiCallTypeLabel,
    isAiCallTypeCode,
} from '@/modules/entities/ai-analytics/lib/ai-call-types.data';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

export interface ReportSettingsBadgeGroup {
    /** Ключ группы для React. */
    key: 'general' | 'methodology';
    title: string;
    badges: PortalViewBadgeOption[];
}

/**
 * Две группы бейджей: «Общие» и методика портала. Пустая группа не
 * показывается; у методики без названия подпись — просто «Методика».
 */
export const groupBadges = (
    badges: readonly PortalViewBadgeOption[],
    methodology: PortalViewMethodology | null,
): ReportSettingsBadgeGroup[] => {
    const general = badges.filter(badge => badge.group === 'general');
    const fromMethodology = badges.filter(badge => badge.group === 'methodology');
    const groups: ReportSettingsBadgeGroup[] = [];
    if (general.length > 0) {
        groups.push({
            key: 'general',
            title: REPORT_SETTINGS_TEXT.badges.general,
            badges: general,
        });
    }
    if (fromMethodology.length > 0) {
        groups.push({
            key: 'methodology',
            title: methodology
                ? REPORT_SETTINGS_TEXT.badges.methodology(methodology.title)
                : REPORT_SETTINGS_TEXT.badges.methodologyFallback,
            badges: fromMethodology,
        });
    }
    return groups;
};

/** Подгруппа бейджей с одним набором типов звонков. */
export interface ReportSettingsBadgeSubgroup {
    /** Ключ подгруппы для React: коды типов через «+», у бейджей без типа — пустой. */
    key: string;
    /** Названия типов звонков для подзаголовка; null — бейджи без типа, подзаголовка нет. */
    title: string | null;
    /** Коды типов подгруппы в порядке справочника; у бейджей без типа — пусто. */
    callTypes: string[];
    badges: PortalViewBadgeOption[];
}

/** Порядок типов в подзаголовке — как в справочнике типов звонков. */
const CALL_TYPE_RANK = new Map<string, number>(
    Object.keys(AI_CALL_TYPE_LABELS).map((code, index) => [code, index]),
);

/** Известные типы бейджа без повторов, в порядке справочника. */
const knownCallTypes = (badge: PortalViewBadgeOption) =>
    [...new Set(badge.callTypes.filter(isAiCallTypeCode))].sort(
        (left, right) =>
            (CALL_TYPE_RANK.get(left) ?? 0) - (CALL_TYPE_RANK.get(right) ?? 0),
    );

/**
 * Разбивка бейджей группы по типам звонков: бейджи с одним и тем же набором
 * типов стоят вместе под общим подзаголовком («Холодный», «Доработка,
 * Решение»). Подгруппы идут в порядке первого своего бейджа, бейджи внутри —
 * в исходном порядке. Бейджи без типа (общие) — одна подгруппа без
 * подзаголовка; незнакомый код типа пользователю не показывается.
 *
 * Подгруппа, чьи бейджи относятся сразу ко всем типам, которые встречаются в
 * группе, подписана «Все типы звонков методики», а не перечнем названий.
 */
export const splitBadgesByCallTypes = (
    badges: readonly PortalViewBadgeOption[],
): ReportSettingsBadgeSubgroup[] => {
    const byKey = new Map<string, ReportSettingsBadgeSubgroup>();
    for (const badge of badges) {
        const types = knownCallTypes(badge);
        const key = types.join('+');
        const subgroup = byKey.get(key);
        if (subgroup) {
            subgroup.badges.push(badge);
            continue;
        }
        byKey.set(key, {
            key,
            title:
                types.length > 0
                    ? types.map(code => aiCallTypeLabel(code)).join(', ')
                    : null,
            callTypes: types,
            badges: [badge],
        });
    }
    const subgroups = [...byKey.values()];
    const titled = subgroups.filter(subgroup => subgroup.title !== null);
    const allTypes = new Set(titled.flatMap(subgroup => subgroup.callTypes));
    // «Все типы» имеет смысл, только когда рядом есть подгруппы поуже.
    if (titled.length < 2) return subgroups;
    return subgroups.map(subgroup =>
        subgroup.callTypes.length > 1 && subgroup.callTypes.length === allTypes.size
            ? { ...subgroup, title: REPORT_SETTINGS_TEXT.badges.allCallTypes }
            : subgroup,
    );
};

/**
 * Типы звонков бейджа методики мелким текстом: названия, а не коды. Неизвестный
 * код пользователю не показываем; нет ни одного типа — null (показывать нечего).
 */
export const badgeCallTypesText = (badge: PortalViewBadgeOption): string | null => {
    const titles = badge.callTypes
        .filter(isAiCallTypeCode)
        .map(code => aiCallTypeLabel(code));
    return titles.length > 0
        ? REPORT_SETTINGS_TEXT.badges.callTypes(titles.join(', '))
        : null;
};
