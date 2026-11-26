'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { ProviderChoice } from '@/modules/features/provider-select';
import { useOfferInvoice } from '../hooks/use-offer-invoice';
import { PartyHint } from './PartyHint';

/**
 * «От кого и счёт» (Word и PDF): поставщик, «Сделать счёт?», «Сделать счета для
 * всех товаров?» (при наборах для сравнения), «Оплатить счёт до» и номер счёта.
 * Вопросы стоят в одну строку, дата и номер — в другую; подсказка нумератора
 * спрятана за значком.
 */
export const InvoiceOptions = () => {
    const invoice = useOfferInvoice();

    return (
        <SectionCard title="От кого и счёт" tone="complect" density="compact" contentClassName="px-3">
            <div className="flex flex-col gap-3">
                <ProviderChoice />
                <div className="flex flex-wrap gap-x-5 gap-y-2">
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
                    <div className="grid gap-x-3 gap-y-2 sm:grid-cols-2">
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
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor="offer-invoice-number">Номер счёта</Label>
                                {invoice.numberHint ? <PartyHint label="Номер счёта" text={invoice.numberHint} /> : null}
                            </div>
                            <Input
                                id="offer-invoice-number"
                                value={invoice.invoiceNumber}
                                placeholder="присвоит нумератор"
                                onChange={event => invoice.setNumber(event.target.value)}
                                onBlur={invoice.saveNumber}
                            />
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
