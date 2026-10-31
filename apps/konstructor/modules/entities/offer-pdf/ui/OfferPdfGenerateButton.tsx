'use client';

import { Check, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useOfferPdfDocument } from '../model/OfferPdfDocumentContext';

/** «Сформировать PDF»: блокер, результат — ссылка на файл. */
export const OfferPdfGenerateButton = () => {
    const { blocker, generate, runGenerate } = useOfferPdfDocument();
    const isGenerating = generate.status === 'generating';

    return (
        <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={() => void runGenerate()} disabled={Boolean(blocker) || isGenerating}>
                {generate.status === 'done' ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {isGenerating ? 'Формирую…' : 'Сформировать PDF'}
            </Button>
            {blocker ? <p className="text-xs text-muted-foreground">{blocker}</p> : null}
            {generate.error ? <p className="text-xs text-destructive">{generate.error}</p> : null}
            {generate.result ? (
                <a
                    href={generate.result.bitrixLink ?? generate.result.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                    <ExternalLink className="h-3 w-3" />
                    Открыть PDF
                </a>
            ) : null}
            {generate.result?.savedToDeal ? (
                <p className="text-xs text-muted-foreground">Файл прикреплён к сделке и отмечен в её истории.</p>
            ) : null}
            {generate.result?.dealMessage ? (
                <p className="text-xs text-warning">{generate.result.dealMessage}</p>
            ) : null}
        </div>
    );
};
