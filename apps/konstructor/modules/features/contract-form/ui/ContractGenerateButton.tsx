'use client';

import { Check, ExternalLink, FileSignature } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useContractGenerate } from '../hooks/use-contract-generate';

/** «Сформировать договор»: блокер, ошибка, ссылка на результат. */
export const ContractGenerateButton = () => {
    const generate = useContractGenerate();

    return (
        <div className="flex flex-col gap-2">
            <Button
                className="w-full"
                onClick={() => void generate.run()}
                disabled={Boolean(generate.blocker) || generate.isGenerating}
            >
                {generate.isDone ? <Check className="h-4 w-4" /> : <FileSignature className="h-4 w-4" />}
                {generate.isGenerating ? 'Формирую…' : 'Сформировать договор'}
            </Button>
            {generate.blocker ? <p className="text-xs text-muted-foreground">{generate.blocker}</p> : null}
            {generate.error ? <p className="text-xs text-destructive">{generate.error}</p> : null}
            {generate.isDone && generate.link ? (
                <a
                    href={generate.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                    <ExternalLink className="h-3 w-3" />
                    {generate.documentName || 'Договор (DOCX)'}
                </a>
            ) : null}
        </div>
    );
};
