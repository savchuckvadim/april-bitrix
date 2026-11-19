'use client';

import { Input } from '@workspace/ui/components/input';
import { MicroField } from '@workspace/april-ui/fields';
import { CALLS_LIST_TEXT } from '@/modules/entities/calls-list';

const T = CALLS_LIST_TEXT.filters;
const INPUT = 'h-7 w-36 px-2 py-0 text-xs';

interface CallsListPeriodFilterProps {
    from: string;
    to: string;
    /** Период с ошибкой — поля подсвечены, текст ошибки — под строкой. */
    invalid: boolean;
    onChange: (period: { from: string; to: string }) => void;
}

/**
 * Период «с — по»; не длиннее 92 дней (подсказка у полей). Пустое значение
 * (поле очистили или дата набрана не до конца) не применяется — иначе
 * период молча сбросился бы на «последние 30 дней» посреди набора.
 */
export const CallsListPeriodFilter = ({
    from,
    to,
    invalid,
    onChange,
}: CallsListPeriodFilterProps) => (
    <MicroField label={T.period} invalid={invalid}>
        <Input
            type="date"
            value={from}
            max={to || undefined}
            aria-label={T.periodFrom}
            aria-invalid={invalid}
            title={T.periodHint}
            className={INPUT}
            onChange={event =>
                event.target.value && onChange({ from: event.target.value, to })
            }
        />
        <span aria-hidden className="text-xs text-muted-foreground">
            —
        </span>
        <Input
            type="date"
            value={to}
            min={from || undefined}
            aria-label={T.periodTo}
            aria-invalid={invalid}
            title={T.periodHint}
            className={INPUT}
            onChange={event =>
                event.target.value && onChange({ from, to: event.target.value })
            }
        />
        <span className="text-[0.65rem] text-muted-foreground">{T.periodHint}</span>
    </MicroField>
);
