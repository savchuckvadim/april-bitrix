import type {
    PortalViewBadgeOption,
    PortalViewMethodology,
} from '@/modules/feature/portal-view';
// Прямой путь, не барель сущности: нужна одна чистая функция подписи типа.
import {
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
