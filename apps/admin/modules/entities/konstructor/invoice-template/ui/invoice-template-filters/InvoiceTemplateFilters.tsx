'use client';

import * as React from 'react';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { INVOICE_TEMPLATE_VISIBILITY_OPTIONS } from '../../consts/invoice-template-form.consts';

/**
 * Состояние фильтров списка.
 *
 * Все фильтры СЕРВЕРНЫЕ: это состояние превращается в query-параметры
 * (`lib/utils/buildInvoiceTemplateListParams`) и уезжает на бэк. Клиентской
 * фильтрации полученного массива здесь нет — иначе «показать архив» не
 * показал бы ничего, ведь архивные строки бэк по умолчанию не отдаёт.
 */
export interface InvoiceTemplateFiltersState {
    visibility: string;
    portal_id: string;
    agent_id: string;
    /** `undefined` — «не фильтровать по активности». */
    is_active?: boolean;
    is_archived: boolean;
    search: string;
}

export const EMPTY_INVOICE_TEMPLATE_FILTERS: InvoiceTemplateFiltersState = {
    visibility: '',
    portal_id: '',
    agent_id: '',
    is_active: undefined,
    is_archived: false,
    search: '',
};

/** Значение-заглушка: `Select` не принимает пустую строку как значение. */
const ANY_OPTION_VALUE = '__any__';

interface InvoiceTemplateFiltersProps {
    value: InvoiceTemplateFiltersState;
    onChange: (next: InvoiceTemplateFiltersState) => void;
    /** Портальное дерево: портал задан разделом, поле не показывается. */
    portalLocked?: boolean;
}

export function InvoiceTemplateFilters({
    value,
    onChange,
    portalLocked = false,
}: InvoiceTemplateFiltersProps) {
    const patch = (next: Partial<InvoiceTemplateFiltersState>) =>
        onChange({ ...value, ...next });

    return (
        <div className="flex flex-wrap items-end gap-4 rounded-md border p-4">
            <div className="space-y-2">
                <Label htmlFor="invoice-template-search">Поиск</Label>
                <Input
                    id="invoice-template-search"
                    value={value.search}
                    placeholder="Название или код"
                    onChange={(e) => patch({ search: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="invoice-template-visibility">Видимость</Label>
                <Select
                    value={value.visibility || ANY_OPTION_VALUE}
                    onValueChange={(next) =>
                        patch({
                            visibility: next === ANY_OPTION_VALUE ? '' : next,
                        })
                    }
                >
                    <SelectTrigger
                        id="invoice-template-visibility"
                        className="w-56"
                    >
                        <SelectValue placeholder="Любая" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY_OPTION_VALUE}>Любая</SelectItem>
                        {INVOICE_TEMPLATE_VISIBILITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!portalLocked && (
                <div className="space-y-2">
                    <Label htmlFor="invoice-template-portal">ID портала</Label>
                    <Input
                        id="invoice-template-portal"
                        value={value.portal_id}
                        placeholder="Любой"
                        onChange={(e) => patch({ portal_id: e.target.value })}
                    />
                </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="invoice-template-agent">ID поставщика</Label>
                <Input
                    id="invoice-template-agent"
                    value={value.agent_id}
                    placeholder="Любой"
                    onChange={(e) => patch({ agent_id: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="invoice-template-active">Активность</Label>
                <Select
                    value={
                        value.is_active === undefined
                            ? ANY_OPTION_VALUE
                            : String(value.is_active)
                    }
                    onValueChange={(next) =>
                        patch({
                            is_active:
                                next === ANY_OPTION_VALUE
                                    ? undefined
                                    : next === 'true',
                        })
                    }
                >
                    <SelectTrigger id="invoice-template-active" className="w-40">
                        <SelectValue placeholder="Любая" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ANY_OPTION_VALUE}>Любая</SelectItem>
                        <SelectItem value="true">Только активные</SelectItem>
                        <SelectItem value="false">Только неактивные</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center gap-2 pb-2">
                <Checkbox
                    id="invoice-template-archived"
                    checked={value.is_archived}
                    onCheckedChange={(checked) =>
                        patch({ is_archived: checked === true })
                    }
                />
                <Label htmlFor="invoice-template-archived" className="cursor-pointer">
                    Показать архив
                </Label>
            </div>

            <Button
                type="button"
                variant="outline"
                onClick={() =>
                    onChange({
                        ...EMPTY_INVOICE_TEMPLATE_FILTERS,
                        // Портал задан разделом — сброс его не трогает.
                        portal_id: portalLocked ? value.portal_id : '',
                    })
                }
            >
                Сбросить фильтры
            </Button>
        </div>
    );
}
