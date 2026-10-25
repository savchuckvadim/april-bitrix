'use client';

import { BookOpenText, ExternalLink } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { useComplectDescription } from '../hooks/use-complect-description';

/**
 * «Описание комплекта» в саммари шага «Комплект» (легаси ResultContainer →
 * getDescription): DOCX с текстами выбранных блоков, ссылка — под кнопкой.
 */
export const ComplectDescriptionButton = () => {
    const description = useComplectDescription();

    return (
        <div className="flex flex-col gap-1">
            <Button
                variant="outline"
                className="w-full"
                onClick={() => void description.run()}
                disabled={Boolean(description.blocker) || description.isGenerating}
                title={description.blocker ?? 'DOCX с описанием выбранных блоков'}
            >
                <BookOpenText aria-hidden />
                {description.isGenerating ? 'Формирую…' : 'Описание комплекта'}
            </Button>
            {description.error ? <p className="text-xs text-destructive">{description.error}</p> : null}
            {description.link ? (
                <a
                    href={description.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline"
                >
                    <ExternalLink className="h-3 w-3" />
                    {description.documentName ?? 'Открыть описание'}
                    {description.infoblocksCount ? ` · блоков: ${description.infoblocksCount}` : ''}
                </a>
            ) : null}
        </div>
    );
};
