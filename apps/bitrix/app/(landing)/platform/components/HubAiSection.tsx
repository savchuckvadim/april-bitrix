import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HUB_AI_SECTION } from '../model/hub';
import { AiLeaksPreview } from './AiLeaksPreview';
import { PlatformContainer } from './PlatformContainer';
import { PlatformEyebrow } from './PlatformEyebrow';

/** Главный аргумент для собственника: где отдел теряет продажи. */
export function HubAiSection() {
    return (
        <section className="relative isolate overflow-hidden border-y border-border py-16 md:py-28">
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-br from-chart-3/10 via-transparent to-primary/10" />
            <PlatformContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col gap-6">
                    <PlatformEyebrow>{HUB_AI_SECTION.eyebrow}</PlatformEyebrow>
                    <h2 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
                        {HUB_AI_SECTION.title}
                    </h2>
                    <p className="text-pretty text-lg text-muted-foreground">{HUB_AI_SECTION.lead}</p>
                    <ul className="flex flex-col gap-3">
                        {HUB_AI_SECTION.points.map(point => (
                            <li key={point} className="flex gap-3 text-foreground">
                                <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                                <span className="text-pretty">{point}</span>
                            </li>
                        ))}
                    </ul>
                    <Button asChild variant="outline" size="lg" className="h-12 self-start px-6 text-base">
                        <Link href={HUB_AI_SECTION.cta.href}>
                            {HUB_AI_SECTION.cta.label}
                            <ArrowRight className="size-5" aria-hidden />
                        </Link>
                    </Button>
                </div>
                <AiLeaksPreview />
            </PlatformContainer>
        </section>
    );
}
