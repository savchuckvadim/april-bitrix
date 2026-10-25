'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import type { ZakupkiProviderField } from '@/modules/entities/zakupki';

export interface ZakupkiProviderColumnProps {
    title: string;
    fields: ZakupkiProviderField[];
    isEditing: boolean;
    onChange: (code: string, value: string) => void;
}

/** Вымышленный поставщик: просмотр заполненных полей или правка всех девяти. */
export const ZakupkiProviderColumn = ({ title, fields, isEditing, onChange }: ZakupkiProviderColumnProps) => (
    <div className="flex min-w-0 flex-col gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {isEditing ? (
            fields.map(field => {
                const id = `zakupki-${field.code}`;
                return (
                    <div key={field.code} className="flex flex-col gap-1">
                        <Label htmlFor={id}>
                            {field.name}
                            {field.isRequired ? <span className="text-destructive"> *</span> : null}
                        </Label>
                        {field.type === 'text' ? (
                            <Textarea
                                id={id}
                                rows={3}
                                value={field.value ?? ''}
                                placeholder={field.placeholder}
                                onChange={event => onChange(field.code, event.target.value)}
                            />
                        ) : (
                            <Input
                                id={id}
                                value={field.value ?? ''}
                                placeholder={field.placeholder}
                                onChange={event => onChange(field.code, event.target.value)}
                            />
                        )}
                    </div>
                );
            })
        ) : (
            <dl className="flex flex-col gap-1 text-sm">
                {fields
                    .filter(field => field.value?.trim())
                    .map(field => (
                        <div key={field.code} className="flex flex-col">
                            <dt className="text-xs text-muted-foreground">{field.name}</dt>
                            <dd className="whitespace-pre-line">{field.value}</dd>
                        </div>
                    ))}
                {fields.some(field => field.isRequired && !field.value?.trim()) ? (
                    <p className="text-xs text-warning">Обязательные поля не заполнены</p>
                ) : null}
            </dl>
        )}
    </div>
);
