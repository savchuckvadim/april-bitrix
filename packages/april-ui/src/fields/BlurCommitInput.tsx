'use client';

import type { ComponentProps } from 'react';
import { Input } from '@workspace/ui/components/input';
import { useCommitOnBlur } from './use-commit-on-blur';

export interface BlurCommitInputProps
    extends Omit<ComponentProps<typeof Input>, 'value' | 'defaultValue' | 'onChange' | 'onBlur'> {
    value: string;
    /** Новое значение — по blur (Enter снимает фокус), если оно изменилось. */
    onCommit: (value: string) => void;
    /** После фиксации значения (например, запросить падеж). */
    onBlur?: () => void;
}

/**
 * Однострочное поле, которое отдаёт значение по blur, а не на каждый символ:
 * для полей, от которых зависит дорогая пересборка (превью PDF). Enter —
 * «готово»: снимает фокус, значит фиксирует значение и вызывает onBlur.
 */
export const BlurCommitInput = ({ value, onCommit, onBlur, onFocus, onKeyDown, ...props }: BlurCommitInputProps) => {
    const field = useCommitOnBlur(value, onCommit);

    return (
        <Input
            {...props}
            value={field.draft}
            onChange={event => field.setDraft(event.target.value)}
            onFocus={event => {
                field.onFocus();
                onFocus?.(event);
            }}
            onBlur={() => {
                field.onBlur();
                onBlur?.();
            }}
            onKeyDown={event => {
                if (event.key === 'Enter') event.currentTarget.blur();
                onKeyDown?.(event);
            }}
        />
    );
};
