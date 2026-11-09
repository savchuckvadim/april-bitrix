import Link from 'next/link';
import { ArrowRight, Gift } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent } from '@workspace/ui/components/card';
import { HUB_BONUS } from '../model/hub';
import { PlatformContainer } from './PlatformContainer';
import { PlatformEyebrow } from './PlatformEyebrow';

/** Бонус — сайт с заявками в Битрикс24: отдельной яркой плашкой. */
export function HubBonusSite() {
    return (
        <section className="py-16 md:py-24">
            <PlatformContainer>
                <Card className="border-action/40 bg-action/5 py-0">
                    <CardContent className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between lg:p-12">
                        <div className="flex max-w-2xl gap-5">
                            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-action/15 text-action">
                                <Gift className="size-7" aria-hidden />
                            </span>
                            <div className="flex flex-col gap-2">
                                <PlatformEyebrow className="text-action">{HUB_BONUS.eyebrow}</PlatformEyebrow>
                                <h2 className="text-balance text-2xl font-bold leading-tight text-foreground md:text-4xl">{HUB_BONUS.title}</h2>
                                <p className="text-pretty text-muted-foreground">{HUB_BONUS.text}</p>
                            </div>
                        </div>
                        <Button asChild size="lg" className="h-12 shrink-0 bg-action px-6 text-base text-action-foreground hover:bg-action/90">
                            <Link href={HUB_BONUS.cta.href}>
                                {HUB_BONUS.cta.label}
                                <ArrowRight className="size-5" aria-hidden />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </PlatformContainer>
        </section>
    );
}
