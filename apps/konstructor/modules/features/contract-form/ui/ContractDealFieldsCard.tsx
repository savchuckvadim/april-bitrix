'use client';

import { SectionCard } from '@workspace/april-ui/surfaces';
import type { ContractDealField } from '@/modules/entities/contract-document';
import { useContractDealFields } from '../hooks/use-contract-deal-fields';
import { ContractDealFieldInput } from './ContractDealFieldInput';

export interface ContractDealFieldsCardProps {
    /** Состав полей: договор (по умолчанию) или отчёт о поставке */
    fields?: ContractDealField[];
    /** Номер договора — только у договора */
    withContractNumber?: boolean;
    title?: string;
}

/** Карточка Bitrix-полей документа (легаси DocumentPBXCard): даты, ответственный, email, номер. */
export const ContractDealFieldsCard = ({
    fields,
    withContractNumber = true,
    title = 'Сделка',
}: ContractDealFieldsCardProps) => {
    const form = useContractDealFields(fields);

    return (
        <SectionCard
            title={title}
            description={
                form.hasDeal
                    ? 'Поля сделки Bitrix: записываются при уходе с поля.'
                    : 'Сделки ещё нет — значения уйдут только в документ.'
            }
            tone="complect"
            state={form.saveError ? 'error' : undefined}
            message={form.saveError}
        >
            <div className="grid gap-3 sm:grid-cols-2">
                {withContractNumber ? (
                    <ContractDealFieldInput
                        id="contract-number"
                        label="Номер договора"
                        type="string"
                        value={form.contractNumber}
                        onChange={form.setContractNumber}
                    />
                ) : null}
                {form.fields.map(field => (
                    <ContractDealFieldInput
                        key={field.code}
                        id={`contract-${field.code}`}
                        label={field.label}
                        type={field.type}
                        value={field.value}
                        required={field.required}
                        saving={form.savingField === field.code}
                        onChange={value => form.setValue(field.code, value)}
                        onBlur={() => form.save(field.code)}
                    />
                ))}
            </div>
        </SectionCard>
    );
};
