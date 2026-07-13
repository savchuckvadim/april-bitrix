'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { useUpdateRq } from '../../lib/hooks';
import type { CreateRq, UpdateRq } from '../../model';
import {
    RqFields,
    collectRqPayload,
    rqToFormValues,
    type RqFormValues,
} from '../RqFields';

/**
 * Форма редактирования реквизитов поставщика (PATCH /provider/rq/{id}).
 * `rqId` — id набора реквизитов, `initial` — слабо типизированные данные с бэка.
 */
export function RqForm({
    rqId,
    domain,
    initial,
    onDone,
}: {
    rqId: number;
    domain: string;
    initial: Record<string, unknown>;
    onDone: () => void;
}) {
    const update = useUpdateRq(domain);

    const [type, setType] = React.useState(
        initial.type == null ? '' : String(initial.type),
    );
    const [values, setValues] = React.useState<RqFormValues>(() =>
        rqToFormValues(initial),
    );
    const [error, setError] = React.useState<string | null>(null);

    const onChange = (key: keyof CreateRq, value: string) =>
        setValues((prev) => ({ ...prev, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const dto: UpdateRq = { type, ...collectRqPayload(values) };
        update.mutate(
            { id: rqId, dto },
            {
                onSuccess: () => onDone(),
                onError: (err) =>
                    setError(
                        err instanceof Error ? err.message : 'Ошибка обновления.',
                    ),
            },
        );
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <RqFields
                type={type}
                values={values}
                onTypeChange={setType}
                onChange={onChange}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onDone}>
                    Отмена
                </Button>
                <Button type="submit" disabled={update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}
