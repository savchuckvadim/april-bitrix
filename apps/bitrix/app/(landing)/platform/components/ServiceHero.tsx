import { cn } from '@workspace/ui/lib/utils';
import type { PlatformService } from '../model/types';
import { SERVICE_ICONS } from '../lib/service-icons';
import { isShotVisible } from '../lib/shot-visibility';
import { DemoButton } from './DemoButton';
import { HeroGlow } from './HeroGlow';
import { PlatformContainer } from './PlatformContainer';
import { PlatformEyebrow } from './PlatformEyebrow';
import { ServiceBreadcrumb } from './ServiceBreadcrumb';
import { ShotFrame } from './ShotFrame';

export interface ServiceHeroProps {
    service: PlatformService;
}

/** Первый экран сервиса: выгода заголовком, кадр справа, если он есть. */
export function ServiceHero({ service }: ServiceHeroProps) {
    const Icon = SERVICE_ICONS[service.slug];
    const { shotId } = service.hero;
    const withShot = shotId !== undefined && isShotVisible(shotId);

    return (
        <section className="relative isolate border-b border-border">
            <HeroGlow />
            <PlatformContainer className="py-12 md:py-24">
                <ServiceBreadcrumb current={service.name} />
                <div className={cn('grid items-center gap-12', withShot && 'lg:grid-cols-[5fr_6fr] lg:gap-16')}>
                    <div className="flex max-w-4xl flex-col gap-7">
                        <PlatformEyebrow className="flex items-center gap-2">
                            <Icon className="size-5" aria-hidden />
                            {service.name}
                        </PlatformEyebrow>
                        <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                            {service.hero.title}
                        </h1>
                        <p className="max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
                            {service.hero.lead}
                        </p>
                        <DemoButton className="self-start" />
                    </div>
                    {withShot && shotId && <ShotFrame shotId={shotId} priority />}
                </div>
            </PlatformContainer>
        </section>
    );
}
