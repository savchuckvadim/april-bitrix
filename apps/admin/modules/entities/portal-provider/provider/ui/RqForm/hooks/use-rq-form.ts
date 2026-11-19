'use client';

import { useState, type FormEvent } from 'react';
import { useUpdateRq } from '../../../lib/hooks';
import type { CreateRq, UpdateRq } from '../../../model';
import {
    collectRqPayload,
    rqToFormValues,
    type RqFormValues,
} from '../../RqFields';

interface UseRqFormOptions {
    rqId: number;
    domain: string;
    /** Реквизиты с бэка: слабо типизированная карта */
    initial: Record<string, unknown>;
    /** Признак «Работает с НДС» поставщика на момент открытия формы */
    initialWithTax: boolean;
    onDone: () => void;
}

/**
 * Форма правки реквизитов и признака «Работает с НДС» поставщика:
 * одна запись PATCH /provider/rq/{id}, закрывается по ответу бэка.
 */
export const useRqForm = ({
    rqId,
    domain,
    initial,
    initialWithTax,
    onDone,
}: UseRqFormOptions) => {
    const update = useUpdateRq(domain);

    const [type, setType] = useState(initial.type == null ? '' : String(initial.type));
    const [values, setValues] = useState<RqFormValues>(() => rqToFormValues(initial));
    const [withTax, setWithTax] = useState(initialWithTax);
    const [error, setError] = useState<string | null>(null);

    const onChange = (key: keyof CreateRq, value: string): void =>
        setValues(previous => ({ ...previous, [key]: value }));

    const submit = (event: FormEvent): void => {
        event.preventDefault();
        setError(null);
        const dto: UpdateRq = { type, withTax, ...collectRqPayload(values) };
        update.mutate(
            { id: rqId, dto },
            {
                onSuccess: onDone,
                onError: err =>
                    setError(err instanceof Error ? err.message : 'Ошибка обновления.'),
            },
        );
    };

    return {
        type,
        setType,
        values,
        onChange,
        withTax,
        setWithTax,
        error,
        isPending: update.isPending,
        submit,
    };
};
