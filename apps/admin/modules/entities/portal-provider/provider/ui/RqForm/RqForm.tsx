'use client';

import { Button } from '@workspace/ui/components/button';
import { RqFields } from '../RqFields';
import { WithTaxField } from '../WithTaxField';
import { useRqForm } from './hooks/use-rq-form';

interface RqFormProps {
    /** Id набора реквизитов (rqs.id) */
    rqId: number;
    domain: string;
    /** Слабо типизированные реквизиты с бэка */
    initial: Record<string, unknown>;
    /** Признак «Работает с НДС» поставщика сейчас */
    withTax: boolean;
    onDone: () => void;
}

/**
 * Форма редактирования реквизитов и признака «Работает с НДС» поставщика
 * (PATCH /provider/rq/{id}).
 */
export function RqForm({ rqId, domain, initial, withTax, onDone }: RqFormProps) {
    const form = useRqForm({ rqId, domain, initial, initialWithTax: withTax, onDone });

    return (
        <form onSubmit={form.submit} className="space-y-6">
            <WithTaxField id="rq-with-tax" checked={form.withTax} onChange={form.setWithTax} />

            <RqFields
                type={form.type}
                values={form.values}
                onTypeChange={form.setType}
                onChange={form.onChange}
            />

            {form.error && <p className="text-sm text-destructive">{form.error}</p>}

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onDone}>
                    Отмена
                </Button>
                <Button type="submit" disabled={form.isPending}>
                    {form.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
}
