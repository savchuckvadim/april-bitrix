'use client';

import { useState } from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import {
    buildLegacyCredentialsSave,
    getHookDraftError,
    getSecretsCarryOver,
    normalizeHookKey,
} from '../legacy-credentials.util';
import {
    useLegacyCredentials,
    useSaveLegacyCredentials,
} from './use-legacy-credentials';

/**
 * Состояние карточки «Вебхук в online»: портал (домен и номер — из нашей БД),
 * текущие креды из Laravel, черновик нового вебхука, валидация и запись.
 */
export const useLegacyCredentialsForm = (portalId: number) => {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;
    const number = portal.data?.number;
    const credentials = useLegacyCredentials(domain);
    const save = useSaveLegacyCredentials();

    const [draft, setDraft] = useState('');
    const [reveal, setReveal] = useState(false);

    const current = credentials.data;
    const nextKey = normalizeHookKey(draft);
    const error = getHookDraftError({ draft, nextKey, domain, number, current });
    const canSave =
        !!draft.trim() && !error && !!domain && !!current && !save.isPending;

    const submit = () => {
        if (!canSave || !domain || !current || number === undefined) return;
        save.mutate(
            buildLegacyCredentialsSave({ domain, number, nextKey, current }),
            { onSuccess: () => setDraft('') },
        );
    };

    return {
        domain,
        isLoading: portal.isLoading || credentials.isLoading,
        isError: portal.isError || credentials.isError,
        current,
        keysDiffer:
            !!current && current.key !== current.C_REST_WEB_HOOK_URL,
        secretsCarryOver: current ? getSecretsCarryOver(current) : null,
        reveal,
        toggleReveal: () => setReveal(value => !value),
        draft,
        setDraft,
        nextKey,
        error,
        canSave,
        isSaving: save.isPending,
        submit,
    };
};

export type LegacyCredentialsForm = ReturnType<typeof useLegacyCredentialsForm>;
