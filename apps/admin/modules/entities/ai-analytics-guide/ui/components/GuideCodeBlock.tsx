'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';
import { GUIDE_TEXT } from '../../consts/ai-analytics-guide.const';

const COPIED_RESET_MS = 2000;

interface GuideCodeBlockProps {
    value: string;
    label?: string;
    /** Высокий блок (ответ ручки) прокручивается внутри. */
    scroll?: boolean;
}

/** Блок кода (тело запроса, ответ) с кнопкой копирования. */
export const GuideCodeBlock = ({ value, label, scroll }: GuideCodeBlockProps) => {
    const [copied, setCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
        } catch {
            setCopied(false);
            toast.error(GUIDE_TEXT.copyFailed);
        }
    };

    return (
        <div className="space-y-1">
            {label && <p className="text-xs text-muted-foreground">{label}</p>}
            <div className="flex items-start gap-2">
                <pre
                    className={
                        scroll
                            ? 'max-h-[28rem] min-w-0 flex-1 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed'
                            : 'min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs leading-relaxed'
                    }
                >
                    <code>{value}</code>
                </pre>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    title={GUIDE_TEXT.copy}
                    onClick={() => void copy()}
                >
                    {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                    {copied ? GUIDE_TEXT.copied : GUIDE_TEXT.copy}
                </Button>
            </div>
        </div>
    );
};
