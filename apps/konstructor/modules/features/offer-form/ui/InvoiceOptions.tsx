'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ProviderChoice } from '@/modules/features/provider-select';
import { useOfferInvoice } from '../hooks/use-offer-invoice';

/**
 * Поставщик и счёт к КП (Word и PDF): «Сделать счёт?», «Сделать счета для всех
 * товаров?» (при наборах для сравнения), «Оплатить счёт до», номер счёта.
 */
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
                                onCheckedChange={checked => invoice.setAnswer(item.answer, checked === true)}
                            />
                            {item.title}
                        </label>
                    ))}
                </div>
                {invoice.detailsVisible ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="offer-invoice-date">Оплатить счёт до</Label>
                            <Input
                                id="offer-invoice-date"
                                type="date"
                                value={invoice.invoiceDate}
                                onChange={event => invoice.setDate(event.target.value)}
                                onBlur={invoice.saveDate}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="offer-invoice-number">Номер счёта</Label>
                            <Input
                                id="offer-invoice-number"
                                value={invoice.invoiceNumber}
                                onChange={event => invoice.setNumber(event.target.value)}
                                onBlur={invoice.saveNumber}
                            />
                            {invoice.numberHint ? (
                                <p className="text-xs text-muted-foreground">{invoice.numberHint}</p>
                            ) : null}
                        </div>
                        {invoice.saveError ? (
                            <p className="text-xs text-muted-foreground sm:col-span-2">{invoice.saveError}</p>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </SectionCard>
    );
};
