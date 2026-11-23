'use client';

import { Check, FileText } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { DocumentLinks } from '@/modules/shared/ui/DocumentLinks/DocumentLinks';
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
            <DocumentLinks warnings={generate.warnings} links={generate.links} />
        </div>
    );
};
