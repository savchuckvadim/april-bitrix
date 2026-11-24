'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { updateClientChoice } from '@/modules/entities/client-card';
import { CLIENT_TYPE_SAVE_ERROR } from '../lib/client-type-prompt.util';
import { clientTypePromptActions } from '../model/ClientTypePromptSlice';
import {
    selectClientTypePromptOptions,
    selectClientTypePromptVisible,
} from '../model/selectors';

/**
 * Окно «Укажите тип клиента»: показывается, пока тип неизвестен и вопрос не
 * отложен. Выбор пишется в компанию тем же thunk'ом, что и чип в шапке. Шапка
 * обновляется сразу, поэтому окно держится открытым до ответа Битрикса:
 * успех закрывает его, ошибка оставляет с текстом.
 */
export const useClientTypePrompt = () => {
    const dispatch = useAppDispatch();
    const visible = useAppSelector(selectClientTypePromptVisible);
    const options = useAppSelector(selectClientTypePromptOptions);
    const [pendingCode, setPendingCode] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const select = async (code: string) => {
        if (pendingCode) return;
        setError(null);
        setPendingCode(code);
        const saved = await dispatch(updateClientChoice('clientType', code));
        setPendingCode(null);
        if (!saved) setError(CLIENT_TYPE_SAVE_ERROR);
    };

    const defer = () => {
        if (pendingCode) return;
        setError(null);
        dispatch(clientTypePromptActions.deferred());
    };

    return {
        open: visible || pendingCode !== null,
        options,
        pendingCode,
        error,
        select: (code: string) => void select(code),
        defer,
    };
};
