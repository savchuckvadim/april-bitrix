'use client';

import { useRef } from 'react';
import { Button } from '@workspace/ui/components/button';
import { acceptFor, type SiteMediaPickTarget } from '../lib/check-media-file';

interface SiteMediaFileButtonProps {
    target: SiteMediaPickTarget;
    label: string;
    disabled?: boolean;
    variant?: 'default' | 'outline';
    onPick: (file: File) => void;
}

/** Кнопка с выбором файла: диалог сразу показывает только подходящие форматы. */
export function SiteMediaFileButton({
    target,
    label,
    disabled = false,
    variant = 'default',
    onPick,
}: SiteMediaFileButtonProps) {
    const input = useRef<HTMLInputElement>(null);

    return (
        <>
            <input
                ref={input}
                type="file"
                accept={acceptFor(target)}
                className="hidden"
                onChange={event => {
                    const file = event.target.files?.[0];
                    // Тот же файл ещё раз (после ошибки) тоже должен вызвать выбор.
                    event.target.value = '';
                    if (file) onPick(file);
                }}
            />
            <Button
                size="sm"
                variant={variant}
                disabled={disabled}
                onClick={() => input.current?.click()}
            >
                {label}
            </Button>
        </>
    );
}
