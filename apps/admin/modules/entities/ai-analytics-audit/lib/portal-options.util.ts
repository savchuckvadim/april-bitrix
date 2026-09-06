import type { ComboboxOption } from '@workspace/april-ui/fields';
import type { AdminPortalResponseDto } from '@/modules/entities/portal';

/** Порталы админки → варианты комбобокса по домену (без домена — пропуск). */
export const toPortalOptions = (
    portals: readonly AdminPortalResponseDto[] | undefined,
): ComboboxOption[] =>
    (portals ?? [])
        .filter(
            (portal): portal is AdminPortalResponseDto & { domain: string } =>
                Boolean(portal.domain),
        )
        .map(portal => ({
            value: portal.domain,
            label: portal.domain,
            hint: `#${portal.id}`,
        }))
        .sort((left, right) => left.label.localeCompare(right.label));

/** Адрес настроек приложений портала по домену — где включается признак аудита. */
export const findPortalSettingsHref = (
    portals: readonly AdminPortalResponseDto[] | undefined,
    domain: string | undefined,
): string | null => {
    if (!domain) return null;
    const portal = (portals ?? []).find(item => item.domain === domain);
    return portal ? `/portal/${portal.id}/app-settings` : null;
};
