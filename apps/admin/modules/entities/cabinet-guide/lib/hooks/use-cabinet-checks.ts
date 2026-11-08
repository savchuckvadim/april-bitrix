'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/modules/entities/pbx/lib/api-error';
import { CabinetChecksHelper } from '../api/cabinet-checks-helper';

const helper = new CabinetChecksHelper();

const onError = (error: unknown) =>
    toast.error('Проверка не выполнена', { description: getApiErrorMessage(error) });

/** Тестовое письмо; итог (ok и что случилось) — в data. */
export const useCabinetMailTest = () =>
    useMutation({ mutationFn: (email: string) => helper.testMail(email), onError });

/** Тестовое сообщение в привязанный чат; итог — тостом. */
export const useCabinetTelegramTest = (portalId: number) =>
    useMutation({
        mutationFn: (bindingId: string) => helper.testTelegram(portalId, bindingId),
        onSuccess: (result) =>
            result.ok
                ? toast.success('Telegram работает', { description: result.message })
                : toast.error('Telegram не доставил', { description: result.message }),
        onError,
    });
