'use client';

import { Check, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useOfferGenerate } from '../hooks/use-offer-generate';

/** «Сформировать КП»: блокер, варианты-участники, результат (очередь или ссылки). */
export const OfferGenerateButton = () => {
    const generate = useOfferGenerate();

    return (
        <div className="flex flex-col gap-2">
            {generate.participantTitles.length ? (
                <p className="text-xs text-muted-foreground">
                    В КП войдут варианты: {generate.participantTitles.join(', ')}
                </p>
            ) : null}
            <Button
                className="w-full"
                onClick={() => void generate.run()}
                disabled={Boolean(generate.blocker) || generate.isGenerating}
            >
                {generate.isDone ? <Check className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {generate.isGenerating ? 'Формирую…' : 'Сформировать КП'}
            </Button>
            {generate.blocker ? <p className="text-xs text-muted-foreground">{generate.blocker}</p> : null}
            {generate.error ? <p className="text-xs text-destructive">{generate.error}</p> : null}
            {generate.isQueued ? (
                <p className="text-xs text-muted-foreground">
                    КП формируется и появится в сделке вместе со счётом.
                </p>
            ) : null}
            {generate.warnings.map(warning => (
                <p key={warning} className="text-xs text-warning">
                    {warning}
                </p>
            ))}
            {generate.links.length ? (
                <ul className="flex flex-col gap-1">
                    {generate.links.map(link => (
                        <li key={link.link}>
                            <a
                                href={link.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                            >
                                <ExternalLink className="h-3 w-3" />
                                {link.name}
                            </a>
                        </li>
                    ))}
                </ul>
            ) : null}
        </div>
    );
};
