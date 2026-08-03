'use client';

import { FC, FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { useManualSearch } from '../../lib/hooks';

interface ManualSearchFormProps {
    disabled?: boolean;
}

/**
 * Ручной поиск дублей.
 *
 * Нужен там, где искать не от кого: пустая сделка без компании, карточка
 * звонка без привязки. Три поля — ИНН, название, ID компании — закрывают все
 * случаи, в которых менеджер что-то знает о клиенте.
 */
export const ManualSearchForm: FC<ManualSearchFormProps> = ({ disabled }) => {
    const form = useManualSearch();

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (!disabled) form.submit();
    };

    return (
        <form onSubmit={onSubmit} className="space-y-2">
            <div className="space-y-1">
                <Label htmlFor="duplicates-inn" className="text-xs font-semibold">
                    ИНН
                </Label>
                <Input
                    id="duplicates-inn"
                    value={form.inn}
                    inputMode="numeric"
                    placeholder="7707083893"
                    onChange={event => form.setInn(event.target.value)}
                />
            </div>

            <div className="space-y-1">
                <Label
                    htmlFor="duplicates-title"
                    className="text-xs font-semibold"
                >
                    Название компании
                </Label>
                <Input
                    id="duplicates-title"
                    value={form.title}
                    placeholder="Ромашка"
                    onChange={event => form.setTitle(event.target.value)}
                />
            </div>

            <div className="space-y-1">
                <Label
                    htmlFor="duplicates-company"
                    className="text-xs font-semibold"
                >
                    ID компании
                </Label>
                <Input
                    id="duplicates-company"
                    value={form.companyId}
                    inputMode="numeric"
                    placeholder="431"
                    onChange={event => form.setCompanyId(event.target.value)}
                />
            </div>

            <Button
                type="submit"
                size="sm"
                className="w-full"
                disabled={form.isEmpty || disabled}
            >
                <Search aria-hidden className="size-4" />
                Найти дубли
            </Button>
        </form>
    );
};
