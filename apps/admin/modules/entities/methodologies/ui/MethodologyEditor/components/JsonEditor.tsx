'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@workspace/ui/components/button';
import { Textarea } from '@workspace/ui/components/textarea';
import { METHODOLOGIES_TEXT, type MethodologyConfig } from '../../../model';
import { configToJson, parseConfigJson } from '../../../lib/methodology-form.util';

interface JsonEditorProps {
    config: MethodologyConfig;
    onApply: (config: MethodologyConfig) => void;
}

/** Полный конфиг как JSON: правки применяются кнопкой, внешние изменения подтягиваются. */
export const JsonEditor = ({ config, onApply }: JsonEditorProps) => {
    const texts = METHODOLOGIES_TEXT.json;
    const [text, setText] = useState(() => configToJson(config));
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setText(configToJson(config));
        setError(null);
    }, [config]);

    const apply = () => {
        const parsed = parseConfigJson(text);
        if (!parsed.config) {
            setError(parsed.error);
            toast.error(texts.invalid, { description: parsed.error ?? undefined });
            return;
        }
        setError(null);
        onApply(parsed.config);
        toast.success(texts.applied);
    };

    return (
        <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{texts.hint}</p>
            <Textarea
                aria-label="JSON"
                rows={24}
                className="font-mono text-xs"
                spellCheck={false}
                value={text}
                onChange={event => setText(event.target.value)}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="button" variant="outline" size="sm" onClick={apply}>
                {texts.apply}
            </Button>
        </div>
    );
};
