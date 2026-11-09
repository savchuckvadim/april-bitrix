import type { ReactNode } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { PlatformContainer } from './PlatformContainer';
import { PlatformEyebrow } from './PlatformEyebrow';

export interface PlatformSectionProps {
    id?: string;
    eyebrow?: string;
    title?: string;
    lead?: string;
    /** `muted` — подложка, чтобы соседние секции не сливались. */
    tone?: 'plain' | 'muted';
    children: ReactNode;
}

/** Секция страницы: подпись, заголовок-выгода, вводная и содержимое. */
export function PlatformSection({
    id,
    eyebrow,
    title,
    lead,
    tone = 'plain',
    children,
}: PlatformSectionProps) {
    return (
        <section
            id={id}
            className={cn('scroll-mt-20 py-16 md:py-28', tone === 'muted' && 'bg-muted/30')}
        >
            <PlatformContainer>
                {title && (
                    <div className="mb-12 max-w-4xl md:mb-16">
                        {eyebrow && <PlatformEyebrow className="mb-4">{eyebrow}</PlatformEyebrow>}
                        <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                            {title}
                        </h2>
                        {lead && (
                            <p className="mt-5 max-w-[60ch] text-pretty text-lg text-muted-foreground">
                                {lead}
                            </p>
                        )}
                    </div>
                )}
                {children}
            </PlatformContainer>
        </section>
    );
}
