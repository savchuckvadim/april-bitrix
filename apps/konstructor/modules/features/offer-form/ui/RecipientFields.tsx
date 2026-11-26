'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useOfferRecipient } from '../hooks/use-offer-recipient';
import { PartyHint } from './PartyHint';
import { RecipientInput } from './RecipientInput';

/**
 * «Кому»: компания и ИНН в одной строке, должность и ФИО в другой; падежи
 * (склоняет бэк) стоят мелкой строкой под полем, пояснение — в подсказке.
 */
export const RecipientFields = () => {
    const form = useOfferRecipient();
    const { recipient } = form;

    return (
        <SectionCard
            title="Кому"
            tone="complect"
            density="compact"
            contentClassName="px-3"
            actions={
                <PartyHint
                    label="Кому адресовано КП"
                    text="Обращение и должность склоняются автоматически: в КП подставится нужный падеж."
                />
            }
        >
            <div className="flex flex-col gap-2">
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
                    <RecipientInput
                        id="offer-company"
                        label="Название компании"
                        value={recipient.companyName}
                        onChange={value => form.setField('companyName', value)}
                    />
                    <RecipientInput
                        id="offer-inn"
                        label="ИНН"
                        value={recipient.inn}
                        onChange={value => form.setField('inn', value)}
                        placeholder="10 или 12 цифр"
                    />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    <RecipientInput
                        id="offer-position"
                        label="Должность"
                        value={recipient.position}
                        onChange={value => form.setField('position', value)}
                        onBlur={() => form.blurCase('position')}
                        cased={recipient.positionCase}
                        casedLoading={form.isCaseLoading('position')}
                        placeholder="Генеральный директор"
                    />
                    <RecipientInput
                        id="offer-name"
                        label="ФИО"
                        value={recipient.name}
                        onChange={value => form.setField('name', value)}
                        onBlur={() => form.blurCase('name')}
                        cased={recipient.nameCase}
                        casedLoading={form.isCaseLoading('name')}
                        placeholder="Иванов Иван Иванович"
                    />
                </div>
            </div>
        </SectionCard>
    );
};
