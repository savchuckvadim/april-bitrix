'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import { useOfferRecipient } from '../hooks/use-offer-recipient';
import { RecipientInput } from './RecipientInput';

/** Шапка КП: компания, ИНН, адресат и его должность (падежи — бэк). */
export const RecipientFields = () => {
    const form = useOfferRecipient();
    const { recipient } = form;

    return (
        <SectionCard
            title="Получатель"
            description="Кому адресовано КП. Обращение и должность склоняются автоматически."
            tone="complect"
        >
            <div className="grid gap-3 sm:grid-cols-2">
                <RecipientInput
                    id="offer-company"
                    label="Название компании"
                    value={recipient.companyName}
                    onChange={value => form.setField('companyName', value)}
                    className="sm:col-span-2"
                />
                <RecipientInput
                    id="offer-inn"
                    label="ИНН"
                    value={recipient.inn}
                    onChange={value => form.setField('inn', value)}
                    placeholder="10 или 12 цифр"
                />
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
                    className="sm:col-span-2"
                />
            </div>
        </SectionCard>
    );
};
