'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ProviderChoice } from '@/modules/features/provider-select';
import { useOfferInvoice } from '../hooks/use-offer-invoice';

/** Поставщик и счёт к КП: вопросы легаси-меню, дата первой оплаты, номер. */
export const InvoiceOptions = () => {
    const invoice = useOfferInvoice();

    return (
        <SectionCard title="Поставщик и счёт" tone="complect">
            <div className="flex flex-col gap-4">
                <ProviderChoice />
                <div className="flex flex-col gap-2">
                    {invoice.answers.map(item => (
                        <label key={item.answer} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={item.value}
                                disabled={item.answer !== 'needGeneralInvoice' && !invoice.detailsEnabled}
                                onCheckedChange={checked => invoice.setAnswer(item.answer, checked === true)}
                            />
                            {item.title}
                        </label>
                    ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="offer-invoice-date">Дата оплаты</Label>
                        <Input
                            id="offer-invoice-date"
                            type="date"
                            value={invoice.invoice.invoiceDate}
                            disabled={!invoice.detailsEnabled}
                            onChange={event => invoice.setDate(event.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <Label htmlFor="offer-invoice-number">Номер счёта</Label>
                        <Input
                            id="offer-invoice-number"
                            value={invoice.invoice.invoiceNumber}
                            disabled={!invoice.detailsEnabled}
                            placeholder="пусто — присвоит бэк"
                            onChange={event => invoice.setNumber(event.target.value)}
                        />
                    </div>
                </div>
            </div>
        </SectionCard>
    );
};
