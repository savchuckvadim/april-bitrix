'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { HookNotice } from '@/modules/entities/hooks/ui/components/HookNotice';
import { useMethodologyAssist } from '../../../lib/hooks/use-methodologies';
import {
    METHODOLOGIES_TEXT,
    type MethodologyAssistResult,
    type MethodologyConfig,
} from '../../../model';

interface AssistantPanelProps {
    domain: string | undefined;
    code: string;
    title: string;
    onApply: (config: MethodologyConfig) => void;
}

const ACCEPT = '.pdf,.docx,.txt,.md';

/** Помощник: документ или текст → черновик конфига, который заменяет форму. */
export const AssistantPanel = ({ domain, code, title, onApply }: AssistantPanelProps) => {
    const texts = METHODOLOGIES_TEXT.assistant;
    const assist = useMethodologyAssist();
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState('');
    const [result, setResult] = useState<MethodologyAssistResult | null>(null);
    const canRun = Boolean(file) || text.trim() !== '';

    const run = () => {
        if (!canRun) {
            toast.warning(texts.noInput);
            return;
        }
        assist.mutate(
            { file, text, domain, code, title },
            {
                onSuccess: next => {
                    setResult(next);
                    if (next.draft) {
                        onApply(next.draft);
                        toast.success(texts.applyNote);
                    } else {
                        toast.error(texts.failed);
                    }
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            <div>
                <p className="font-medium">{texts.title}</p>
                <p className="text-sm text-muted-foreground">{texts.intro}</p>
            </div>
            <div className="space-y-1">
                <Label htmlFor="methodology-assist-file">{texts.file}</Label>
                <Input
                    id="methodology-assist-file"
                    type="file"
                    accept={ACCEPT}
                    onChange={event => setFile(event.target.files?.[0] ?? null)}
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="methodology-assist-text">{texts.text}</Label>
                <Textarea
                    id="methodology-assist-text"
                    rows={8}
                    placeholder={texts.textPlaceholder}
                    value={text}
                    onChange={event => setText(event.target.value)}
                />
            </div>
            <Button type="button" onClick={run} disabled={assist.isPending || !canRun}>
                {assist.isPending ? texts.running : texts.run}
            </Button>
            {result && (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                        {texts.answeredBy(result.provider, result.model, result.textChars)}
                    </p>
                    {result.errors.length > 0 && (
                        <HookNotice
                            tone="error"
                            title={texts.errors}
                            message={
                                <ul className="list-disc space-y-0.5 pl-4">
                                    {result.errors.map(error => (
                                        <li key={error}>{error}</li>
                                    ))}
                                </ul>
                            }
                        />
                    )}
                    {result.warnings.length > 0 && (
                        <HookNotice
                            tone="warning"
                            title={texts.warnings}
                            message={
                                <ul className="list-disc space-y-0.5 pl-4">
                                    {result.warnings.map(warning => (
                                        <li key={warning}>{warning}</li>
                                    ))}
                                </ul>
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
};
