'use client';

import { FC } from 'react';
import { MicroSelect } from '@workspace/april-ui';
import { Input } from '@workspace/ui/components/input';
import { checklistEnumItems } from '../../lib/checklist-values';
import type { ChecklistFieldView } from '../../lib/checklist-field-view';

const NUMERIC_CLASS = 'h-6 w-34 px-2 py-0 text-[0.6875rem]';

/**
 * Контрол поля чек-листа по его типу.
 *
 * `datetime` — именно `datetime-local`: поле портала хранит дату СО ВРЕМЕНЕМ
 * («Дата последнего счёта», «Направлено КП»), а контрол `type=date` молча
 * терял время и обнулял его обратной записью.
 */
export const ChecklistFieldControl: FC<{ field: ChecklistFieldView }> = ({
    field,
}) => {
    const { def } = field;

    if (def.type === 'enumeration' && field.field) {
        return (
            <MicroSelect
                ariaLabel={def.title}
                value={field.value || undefined}
                placeholder="Выбрать"
                options={checklistEnumItems(field.field).map(item => ({
                    value: item.code,
                    label: item.name,
                }))}
                onChange={field.setValue}
            />
        );
    }

    if (def.type === 'money') {
        return (
            <Input
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                value={field.value}
                placeholder="0"
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className={NUMERIC_CLASS}
            />
        );
    }

    if (def.type === 'datetime') {
        return (
            <Input
                type="datetime-local"
                value={field.value}
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className="h-6 w-44 px-2 py-0 text-[0.6875rem]"
            />
        );
    }

    if (def.type === 'date') {
        return (
            <Input
                type="date"
                value={field.value}
                aria-label={def.title}
                aria-invalid={field.isMissing}
                onChange={e => field.setValue(e.target.value)}
                className={NUMERIC_CLASS}
            />
        );
    }

    // Текст (`string`): формулировка клиента своими словами. Плейсхолдер
    // задаётся каталогом — он подсказывает, ЧТО именно записать, и для
    // ответов-цитат это половина смысла контрола.
    return (
        <Input
            type="text"
            value={field.value}
            aria-label={def.title}
            aria-invalid={field.isMissing}
            placeholder={def.placeholder}
            onChange={e => field.setValue(e.target.value)}
            className="h-6 w-56 px-2 py-0 text-[0.6875rem]"
        />
    );
};
