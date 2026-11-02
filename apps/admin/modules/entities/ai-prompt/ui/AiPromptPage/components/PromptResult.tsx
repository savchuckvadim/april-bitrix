'use client';

import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { resultMeta } from '../../../lib/prompt-view';
import { AI_PROMPT_TEXT, type LlmPromptRunResult } from '../../../model';

interface PromptResultProps {
    result: LlmPromptRunResult | null;
    pending: boolean;
}

/** Ответ модели: кто ответил, время и расход, текст с переносами, копирование. */
export const PromptResult = ({ result, pending }: PromptResultProps) => {
    const copy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result.text);
            toast.success(AI_PROMPT_TEXT.copied);
        } catch {
            toast.error(AI_PROMPT_TEXT.copyFailed);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div className="space-y-1">
                    <CardTitle>{AI_PROMPT_TEXT.result}</CardTitle>
                    {result && (
                        <CardDescription className="space-y-0.5">
                            {resultMeta(result).map((line) => (
                                <span key={line} className="block">
                                    {line}
                                </span>
                            ))}
                        </CardDescription>
                    )}
                </div>
                {result && (
                    <Button variant="outline" size="sm" onClick={() => void copy()}>
                        {AI_PROMPT_TEXT.copy}
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {pending ? (
                    <p className="text-sm text-muted-foreground">
                        {AI_PROMPT_TEXT.running}
                    </p>
                ) : result ? (
                    <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed">
                        {result.text}
                    </pre>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        {AI_PROMPT_TEXT.resultEmpty}
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
