'use client';

import * as React from 'react';
import { usePortal, usePortals } from '@/modules/entities/portal';
import { useProvidersByDomain } from '@/modules/entities/portal-provider';

export interface SelectOption {
    value: string;
    label: string;
}

/**
 * Опции селекта порталов для форм шаблонов (договор, отчёт, счёт, КП).
 * Значение — id СТРОКОЙ: на бэке BIGINT, в JSON едет строкой.
 */
export const usePortalOptions = () => {
    const portals = usePortals();
    const options = React.useMemo<SelectOption[]>(
        () =>
            (portals.data ?? [])
                .map((portal) => ({
                    value: String(portal.id),
                    label: portal.domain ? `${portal.domain} (#${portal.id})` : `Портал #${portal.id}`,
                }))
                .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
        [portals.data],
    );
    return { options, isLoading: portals.isLoading, isError: portals.isError };
};

/**
 * Подпись поставщика: сгенерированный DTO нетипизирован по полям, поэтому
 * читаем защищённо — как ProviderPanel: name поставщика → name реквизитов → #id.
 */
export function providerOptionLabel(provider: Record<string, unknown>): string {
    const rq = (provider.rq ?? {}) as Record<string, unknown>;
    const name =
        (typeof provider.name === 'string' && provider.name) ||
        (typeof rq.name === 'string' && rq.name) ||
        '';
    const id = String(provider.id ?? '');
    return name ? `${name} (#${id})` : `Поставщик #${id}`;
}

/**
 * Опции селекта поставщиков ПОРТАЛА. Поставщики доступны только по домену
 * портала (`useProvidersByDomain`), поэтому сначала portalId → домен →
 * список. Нет портала — пустой список и подсказка «выберите портал».
 */
export const useProviderOptions = (portalId: string | undefined) => {
    const numericId = portalId && /^\d+$/.test(portalId) ? Number(portalId) : 0;
    const portal = usePortal(numericId);
    const domain = portal.data?.domain ?? undefined;
    const providers = useProvidersByDomain(domain);

    const options = React.useMemo<SelectOption[]>(
        () =>
            ((providers.data ?? []) as unknown as ReadonlyArray<Record<string, unknown>>)
                .map((provider) => ({
                    value: String(provider.id ?? ''),
                    label: providerOptionLabel(provider),
                }))
                .filter((option) => option.value !== '')
                .sort((a, b) => a.label.localeCompare(b.label, 'ru')),
        [providers.data],
    );

    return {
        options,
        domain,
        isLoading: numericId > 0 && (portal.isLoading || providers.isLoading),
        isError: portal.isError || providers.isError,
        hasPortal: numericId > 0,
    };
};
