'use client';

import { Check, Copy } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Button } from '@workspace/ui/components/button';
import { AUDIT_TEXT } from '../../../consts/ai-analytics-audit.const';
import { useCopyMarkdown } from '../hooks/use-copy-markdown';
import { MarkdownLite } from '../markdown-lite/MarkdownLite';

interface AuditMarkdownCardProps {
    markdown: string;
}

/** Отчёт markdown с лёгким рендером и кнопкой копирования исходника. */
export const AuditMarkdownCard = ({ markdown }: AuditMarkdownCardProps) => {
    const { copied, copy } = useCopyMarkdown(markdown);

    return (
        <SectionCard
            title={AUDIT_TEXT.markdownTitle}
            density="compact"
            collapsible
            defaultOpen
            actions={
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void copy()}
                >
                    {copied ? (
                        <Check className="size-4 text-success" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                    {copied ? AUDIT_TEXT.copied : AUDIT_TEXT.copyMarkdown}
                </Button>
            }
        >
            <MarkdownLite markdown={markdown} />
        </SectionCard>
    );
};
