'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { LEGACY_CREDENTIALS_TEXT } from '../../consts/legacy-credentials.const';
import { LegacyCredentialsHelper } from '../api/legacy-credentials-helper';
import type { LegacyCredentialsSave } from '../../model';

const helper = new LegacyCredentialsHelper();
const KEY = ['portal-legacy-credentials'] as const;

/** Текущие креды портала в online (Laravel). */
export const useLegacyCredentials = (domain?: string) =>
    useQuery({
        queryKey: [...KEY, domain],
        queryFn: () => helper.get(domain as string),
        enabled: !!domain,
    });

/** Записать креды в online; успех показываем по факту ответа и перечитываем. */
export const useSaveLegacyCredentials = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (dto: LegacyCredentialsSave) => helper.save(dto),
        onSuccess: (_data, dto) => {
            toast.success(LEGACY_CREDENTIALS_TEXT.saved, {
                description: LEGACY_CREDENTIALS_TEXT.savedDescription,
            });
            void qc.invalidateQueries({ queryKey: [...KEY, dto.domain] });
        },
        onError: error =>
            toast.error(LEGACY_CREDENTIALS_TEXT.saveError, {
                description: getApiErrorMessage(error),
            }),
    });
};
