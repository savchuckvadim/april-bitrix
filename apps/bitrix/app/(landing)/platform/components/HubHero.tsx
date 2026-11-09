import Link from 'next/link';
import { Check } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { HUB_HERO } from '../model/hub';
import { DemoButton } from './DemoButton';
import { HeroGlow } from './HeroGlow';
import { OneFormFlow } from './OneFormFlow';
import { PlatformContainer } from './PlatformContainer';
import { PlatformEyebrow } from './PlatformEyebrow';

/** Первый экран раздела: главная выгода, два действия и живая схема «одной формы». */
export function HubHero() {
    return (
        <section className="relative isolate border-b border-border">
            <HeroGlow />
            <PlatformContainer className="grid items-center gap-12 py-16 md:py-28 lg:grid-cols-[7fr_5fr] lg:gap-16">
                <div className="flex flex-col gap-7">
                    <PlatformEyebrow>{HUB_HERO.eyebrow}</PlatformEyebrow>
                    <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl xl:text-7xl">
                        {HUB_HERO.title}
                    </h1>
                    <p className="max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">{HUB_HERO.lead}</p>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <DemoButton />
                        <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
                            <Link href={HUB_HERO.secondary.href}>{HUB_HERO.secondary.label}</Link>
                        </Button>
                    </div>
                    <ul className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-6">
                        {HUB_HERO.proofs.map(proof => (
                            <li key={proof} className="flex items-center gap-2">
                                <Check className="size-4 text-success" aria-hidden />
                                {proof}
                            </li>
                        ))}
                    </ul>
                </div>
                <OneFormFlow />
            </PlatformContainer>
        </section>
    );
}
