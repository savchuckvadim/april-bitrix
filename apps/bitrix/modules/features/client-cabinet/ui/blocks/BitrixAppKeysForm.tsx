'use client';

import { useState } from 'react';
import { AButton, AInput } from '@workspace/april-ui';
import {
    saveBitrixAppKeys,
    type CabinetBitrixAppConnection,
} from '@workspace/bitrix';
import { useCabinetAction } from '../../lib/cabinet-hooks';

type Field = 'clientId' | 'clientSecret';
const EMPTY: Record<Field, string> = { clientId: '', clientSecret: '' };

/**
 * Ключи локального приложения из Битрикс24. Ключ (secret) хранится у April
 * зашифрованным и обратно не показывается — для замены вводится заново.
 */
export const BitrixAppKeysForm = ({
    portalId,
    replacing,
    onSaved,
}: {
    portalId: number;
    replacing: boolean;
    onSaved: (connection: CabinetBitrixAppConnection) => void;
}) => {
    const [form, setForm] = useState(EMPTY);
    const action = useCabinetAction();
    const set = (name: Field, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

    const submit = async () => {
        const result = await action.run(() =>
            saveBitrixAppKeys(portalId, {
                clientId: form.clientId.trim(),
                clientSecret: form.clientSecret.trim(),
            }),
        );
        if (result) {
            setForm(EMPTY);
            onSaved(result);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm font-medium">
                {replacing ? 'Заменить ключи приложения' : 'Ключи приложения из Битрикс24'}
            </p>
            <div className="grid gap-3 md:grid-cols-2">
                <AInput<Field>
                    label="Код приложения (client_id)"
                    errorMessage={null}
                    nameForHandler="clientId"
                    value={form.clientId}
                    autoComplete="off"
                    handleChange={set}
                    handleOnFocus={() => action.clearError()}
                />
                <AInput<Field>
                    label="Ключ приложения (client_secret)"
                    errorMessage={null}
                    nameForHandler="clientSecret"
                    value={form.clientSecret}
                    type="password"
                    autoComplete="off"
                    handleChange={set}
                    handleOnFocus={() => action.clearError()}
                />
            </div>
            {action.error && <p className="text-sm text-destructive">{action.error}</p>}
            <div className="w-48">
                <AButton
                    title={action.busy ? 'Сохраняем…' : 'Сохранить ключи'}
                    isActive={
                        !action.busy &&
                        form.clientId.trim().length > 0 &&
                        form.clientSecret.trim().length > 0
                    }
                    clickHendler={() => void submit()}
                />
            </div>
        </div>
    );
};
