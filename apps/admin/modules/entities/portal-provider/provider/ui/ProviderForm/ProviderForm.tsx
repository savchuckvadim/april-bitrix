'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useCreateProvider } from '../../lib/hooks';
import type { CreateProviderWithRq, CreateRq } from '../../model';
import {
    RqFields,
    collectRqPayload,
    type RqFormValues,
} from '../RqFields';

/**
 * Форма создания поставщика с реквизитами. `domain` приходит из контекста портала
 * и подставляется в payload, поэтому в форме не редактируется.
 */
export function ProviderForm({
    domain,
    onDone,
}: {
    domain: string;
    onDone: () => void;
}) {
    const create = useCreateProvider(domain);

    const [type, setType] = React.useState('');
    const [name, setName] = React.useState('');
    const [code, setCode] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [withTax, setWithTax] = React.useState(false);
    const [rqValues, setRqValues] = React.useState<RqFormValues>({});
    const [error, setError] = React.useState<string | null>(null);

    const onRqChange = (key: keyof CreateRq, value: string) =>
        setRqValues((prev) => ({ ...prev, [key]: value }));

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!type) {
            setError('Выберите тип поставщика.');
            return;
        }
        const dto: CreateProviderWithRq = {
            domain,
            type,
            name,
            code,
            number,
            withTax,
            rq: { type, ...collectRqPayload(rqValues) } as CreateRq,
        };
        create.mutate(dto, {
            onSuccess: () => onDone(),
            onError: (err) =>
                setError(err instanceof Error ? err.message : 'Ошибка создания.'),
        });
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <fieldset className="space-y-3">
                <legend className="text-sm font-semibold text-muted-foreground">
                    Поставщик
                </legend>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="prov-name">Название поставщика</Label>
                        <Input
                            id="prov-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="prov-code">Бизнес-код</Label>
                        <Input
                            id="prov-code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="prov-number">Порядковый номер</Label>
                        <Input
                            id="prov-number"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                            id="prov-tax"
                            checked={withTax}
                            onCheckedChange={(v) => setWithTax(v === true)}
                        />
                        <Label htmlFor="prov-tax">Работает с НДС</Label>
                    </div>
                </div>
            </fieldset>

            <RqFields
                type={type}
                values={rqValues}
                onTypeChange={setType}
                onChange={onRqChange}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onDone}>
                    Отмена
                </Button>
                <Button type="submit" disabled={create.isPending}>
                    {create.isPending ? 'Создание…' : 'Создать'}
                </Button>
            </div>
        </form>
    );
}
