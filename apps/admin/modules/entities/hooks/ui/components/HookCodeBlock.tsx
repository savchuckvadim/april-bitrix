'use client';

import { Check, Copy } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HOOKS_TEXT } from '../../consts/hooks.const';
import { useCopyText } from '../hooks/use-copy-text';

interface HookCodeBlockProps {
    value: string;
    label?: string;
}

/** Строка кода (пример вызова, адрес вебхука) с кнопкой копирования. */
export const HookCodeBlock = ({ value, label }: HookCodeBlockProps) => {
    const { copiedText, copy } = useCopyText();
    const copied = copiedText === value;

    return (
        <div className="space-y-1">
            {label && <p className="text-xs text-muted-foreground">{label}</p>}
            <div className="flex items-start gap-2">
                <pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed">
                    <code>{value}</code>
                </pre>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title={HOOKS_TEXT.copy}
                    onClick={() => void copy(value)}
                >
                    {copied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                    {copied ? HOOKS_TEXT.copied : HOOKS_TEXT.copy}
                </Button>
            </div>
        </div>
    );
};
