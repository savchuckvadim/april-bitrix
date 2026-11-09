import type { PlatformService } from '../model/types';
import { buildServiceBlocks } from '../lib/service-blocks';
import { DemoRequestSection } from './DemoRequestSection';
import { ServiceBlockSection } from './ServiceBlockSection';
import { ServiceHero } from './ServiceHero';

export interface ServicePageViewProps {
    service: PlatformService;
}

/** Страница сервиса: первый экран, секции по порядку, заявка на демо. */
export function ServicePageView({ service }: ServicePageViewProps) {
    return (
        <>
            <ServiceHero service={service} />
            {buildServiceBlocks(service).map(block => (
                <ServiceBlockSection key={block.kind} service={service} block={block} />
            ))}
            <DemoRequestSection />
        </>
    );
}
