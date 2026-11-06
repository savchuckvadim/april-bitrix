'use client';

import type { ComponentProps } from 'react';
import { Textarea } from '@workspace/ui/components/textarea';
import { useCommitOnBlur } from './use-commit-on-blur';

export interface BlurCommitTextareaProps
    extends Omit<ComponentProps<typeof Textarea>, 'value' | 'defaultValue' | 'onChange' | 'onBlur'> {
    value: string;
    /** Новое значение — по blur, если оно изменилось. Enter — перенос строки. */
    onCommit: (value: string) => void;
    onBlur?: () => void;
}

/** Многострочное поле с фиксацией значения по blur (пара к BlurCommitInput). */
export const BlurCommitTextarea = ({ value, onCommit, onBlur, onFocus, ...props }: BlurCommitTextareaProps) => {
    const field = useCommitOnBlur(value, onCommit);

    return (
        <Textarea
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
        />
    );
};
