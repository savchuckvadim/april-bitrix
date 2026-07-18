'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AppSecretDto, UpsertAppSecretDto } from '@workspace/nest-admin-api';
import { getErrorMessage } from '../../../shared';
import { SecretsHelper } from '../api/secrets-helper';

const helper = new SecretsHelper();

/** Список кред приложений (client_secret маскирован). */
export const useSecrets = () => {
    return useQuery<AppSecretDto[], Error>({
        queryKey: ['marketplace-secrets'],
        queryFn: () => helper.list(),
    });
};

/** Креды одного приложения по коду. */
export const useSecret = (code: string) => {
    return useQuery<AppSecretDto, Error>({
        queryKey: ['marketplace-secret', code],
        queryFn: () => helper.get(code),
        enabled: !!code,
    });
};

/** Создание/обновление кред приложения (идемпотентный upsert по коду). */
export const useUpsertSecret = () => {
    const queryClient = useQueryClient();

    return useMutation<AppSecretDto, Error, { code: string; dto: UpsertAppSecretDto }>({
        mutationFn: ({ code, dto }) => helper.upsert(code, dto),
        onSuccess: (_, { code }) => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-secrets'] });
            queryClient.invalidateQueries({ queryKey: ['marketplace-secret', code] });
            toast.success(`Креды приложения «${code}» сохранены`);
        },
        onError: (error) => {
            toast.error('Не удалось сохранить креды', {
                description: getErrorMessage(error),
            });
        },
    });
};

/** Удаление кред приложения по коду. */
export const useDeleteSecret = () => {
    const queryClient = useQueryClient();

    return useMutation<void, Error, string>({
        mutationFn: (code) => helper.delete(code),
        onSuccess: (_, code) => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-secrets'] });
            toast.success(`Креды приложения «${code}» удалены`);
        },
        onError: (error) => {
            toast.error('Не удалось удалить креды', {
                description: getErrorMessage(error),
            });
        },
    });
};
