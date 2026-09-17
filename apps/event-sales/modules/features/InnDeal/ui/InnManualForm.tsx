'use client';

import { FC, useState } from 'react';
import { Plus } from 'lucide-react';
import { FieldErrorHint, MicroSpinner } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { innValidationError } from '@/modules/features/Inn';

interface InnManualFormProps {
    disabled: boolean;
    isSaving: boolean;
    onSubmit: (inn: string) => void;
}

/**
 * «Добавить вручную»: значение проверяется контрольной суммой ЗДЕСЬ же —
 * менеджер не должен ждать ответа сервера, чтобы узнать про опечатку.
 *
 * Проверка — общая с остальным фронтом (`features/Inn`), второй реализации
 * контрольной суммы в приложении быть не должно. Бэк проверяет ещё раз: он
 * единственный писатель и верить фронту не обязан.
 */
export const InnManualForm: FC<InnManualFormProps> = ({
    disabled,
    isSaving,
    onSubmit,
}) => {
    const [draft, setDraft] = useState('');
    const [error, setError] = useState<string | null>(null);

    const submit = (): void => {
        const validation = innValidationError(draft);
        if (validation) {
            setError(validation);
            return;
        }
        setError(null);
        onSubmit(draft.replace(/\D/g, ''));
        setDraft('');
    };

    return (
        <div className="relative flex flex-wrap items-center gap-2">
            <Input
                value={draft}
                onChange={event => {
                    setDraft(event.target.value);
                    if (error) setError(null);
                }}
                placeholder="10 или 12 цифр"
                inputMode="numeric"
                disabled={disabled}
                className="h-7 w-40 text-sm"
                aria-label="Добавить ИНН вручную"
            />
            <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 px-2"
                disabled={disabled || !draft.trim()}
                onClick={submit}
            >
                {isSaving ? (
                    <MicroSpinner size={13} />
                ) : (
                    <Plus aria-hidden className="size-3.5" />
                )}
                Добавить вручную
            </Button>
            <FieldErrorHint error={error} />
        </div>
    );
};
