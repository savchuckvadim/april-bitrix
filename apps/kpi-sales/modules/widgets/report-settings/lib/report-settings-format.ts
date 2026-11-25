import type { PortalViewSettings } from '@/modules/feature/portal-view';
import { REPORT_SETTINGS_TEXT } from '../consts/report-settings.texts';

const pad = (value: number): string => String(value).padStart(2, '0');

/** ISO-дата → «dd.MM.yyyy HH:mm» по времени пользователя; не дата — пустая строка. */
export const formatSettingsDate = (iso: string | null): string => {
    if (!iso) return '';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    const day = `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
    return `${day} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * «Последнее изменение: <кто>, <когда>». Есть только одно из двух — показываем
 * его; нет ни того ни другого (настройки не менялись) — строки нет.
 */
export const lastChangeText = (view: PortalViewSettings): string | null => {
    const parts = [view.updatedBy, formatSettingsDate(view.updatedAt)].filter(
        (part): part is string => Boolean(part),
    );
    return parts.length > 0
        ? `${REPORT_SETTINGS_TEXT.footer.lastChange}: ${parts.join(', ')}`
        : null;
};
