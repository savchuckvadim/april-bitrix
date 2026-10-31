'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { toPortalOptions } from '@/modules/entities/ai-analytics-audit/lib/portal-options.util';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { usePortals } from '@/modules/entities/portal';
import { DEFAULT_PUBLIC_LINK_PERIOD } from '../../../consts/public-link.consts';
import { useCreatePublicLink } from '../../../lib/hooks';
import { periodToDays } from '../../../lib/public-link-view';

/** Форма новой ссылки: название, портал каталога и срок. */
export const usePublicLinkCreateForm = (onCreated: () => void) => {
    const portals = usePortals();
    const createLink = useCreatePublicLink();

    const [title, setTitle] = useState('');
    const [domain, setDomain] = useState<string | undefined>();
    const [period, setPeriod] = useState(DEFAULT_PUBLIC_LINK_PERIOD);

    const portalOptions = useMemo(
        () => toPortalOptions(portals.data),
        [portals.data],
    );
    const portalId = (portals.data ?? []).find(
        portal => portal.domain === domain,
    )?.id;

    const submit = async () => {
        if (!portalId) return;
        try {
            await createLink.mutateAsync({
                portalId,
                title: title.trim(),
                expiresInDays: periodToDays(period),
            });
            toast.success('Ссылка создана, адрес можно скопировать в таблице');
            setTitle('');
            setDomain(undefined);
            setPeriod(DEFAULT_PUBLIC_LINK_PERIOD);
            onCreated();
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Не удалось создать ссылку'));
        }
    };

    return {
        title,
        setTitle,
        domain,
        setDomain,
        period,
        setPeriod,
        portalOptions,
        isSubmitting: createLink.isPending,
        canSubmit: Boolean(title.trim()) && Boolean(portalId),
        submit,
    };
};
