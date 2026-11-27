'use client';

import { Label } from '@workspace/ui/components/label';
import { RadioGroup, RadioGroupItem } from '@workspace/ui/components/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Field } from '@workspace/ui/shared';
import {
    INVOICE_BIND_MODE_LABELS,
    type InvoiceBindMode,
} from '@/modules/entities/invoice-template';

export interface InvoiceBindModeFieldProps {
    mode: InvoiceBindMode;
    /** Режимы, которые можно выбрать, в порядке показа. */
    options: readonly InvoiceBindMode[];
    agentId: string | null;
    providers: readonly { id: string; name: string }[];
    modeError?: string;
    agentError?: string;
    onMode: (mode: InvoiceBindMode) => void;
    onAgent: (agentId: string) => void;
}

/** Привязка шаблона: общий, портал или поставщик портала. */
export const InvoiceBindModeField = ({
    mode,
    options,
    agentId,
    providers,
    modeError,
    agentError,
    onMode,
    onAgent,
}: InvoiceBindModeFieldProps) => (
    <div className="flex flex-col gap-3">
        <Field
            label="Привязка"
            required
            error={modeError}
            helperText="Общий шаблон доступен всем порталам, шаблон портала только вашему, шаблон поставщика только при выборе этого поставщика."
        >
            <RadioGroup
                value={mode}
                onValueChange={value => onMode(value as InvoiceBindMode)}
                className="gap-2"
            >
                {options.map(option => (
                    <div key={option} className="flex items-center gap-2">
                        <RadioGroupItem id={`invoice-bind-${option}`} value={option} />
                        <Label
                            htmlFor={`invoice-bind-${option}`}
                            className="cursor-pointer font-normal"
                        >
                            {INVOICE_BIND_MODE_LABELS[option]}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </Field>
        {mode === 'provider' ? (
            <Field label="Поставщик" required error={agentError}>
                <Select value={agentId ?? ''} onValueChange={onAgent}>
                    <SelectTrigger className="w-full" aria-label="Поставщик">
                        <SelectValue placeholder="Выберите поставщика" />
                    </SelectTrigger>
                    <SelectContent>
                        {providers.map(provider => (
                            <SelectItem key={provider.id} value={provider.id}>
                                {provider.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </Field>
        ) : null}
    </div>
);
