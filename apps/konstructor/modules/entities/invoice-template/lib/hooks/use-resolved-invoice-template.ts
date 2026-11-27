'use client';

import { useEffect, useState } from 'react';
import type {
    InvoiceTemplateCriteria,
    ResolvedInvoiceTemplate,
} from '../../model';
import { InvoiceTemplateHelper } from '../api/invoice-template.helper';
import { requestErrorText } from '../invoice-template-list.util';

const helper = new InvoiceTemplateHelper();

export interface ResolvedInvoiceState {
    /** idle: признаков нет (нет домена), подбор не запрашивался. */
    status: 'idle' | 'loading' | 'ready' | 'error';
    value: ResolvedInvoiceTemplate | null;
    error: string | null;
}

const IDLE: ResolvedInvoiceState = { status: 'idle', value: null, error: null };

/**
 * Какой шаблон счёта уйдёт на этих признаках: тот же подбор, что у генерации.
 * Запрос повторяется на смену признаков и на `version` (список шаблонов
 * изменился, победитель мог смениться). Пока идёт повторный запрос, прежний
 * ответ остаётся на экране; ответ на устаревшие признаки отбрасывается.
 */
export const useResolvedInvoiceTemplate = (
    criteria: InvoiceTemplateCriteria | null,
    version: number,
): ResolvedInvoiceState => {
    const [state, setState] = useState<ResolvedInvoiceState>(IDLE);
    const domain = criteria?.domain ?? '';
    const providerId = criteria?.providerId ?? null;
    const clientType = criteria?.clientType ?? null;
    const supplyType = criteria?.supplyType ?? null;

    useEffect(() => {
        if (!domain) {
            setState(IDLE);
            return;
        }
        let isCurrent = true;
        setState(prev => ({ ...prev, status: 'loading', error: null }));
        helper
            .resolve({ domain, providerId, clientType, supplyType })
            .then(value => {
                if (isCurrent) setState({ status: 'ready', value, error: null });
            })
            .catch((failure: unknown) => {
                if (!isCurrent) return;
                setState({
                    status: 'error',
                    value: null,
                    error: requestErrorText(
                        failure,
                        'Не удалось определить шаблон',
                    ),
                });
            });
        return () => {
            isCurrent = false;
        };
    }, [domain, providerId, clientType, supplyType, version]);

    return state;
};
