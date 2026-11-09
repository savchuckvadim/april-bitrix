import type { PlatformService } from '../model/types';
import type { ShotMediaMap } from '../lib/platform-media';
import { buildServiceBlocks } from '../lib/service-blocks';
import { DemoRequestSection } from './DemoRequestSection';
import { ServiceBlockSection } from './ServiceBlockSection';
import { ServiceHero } from './ServiceHero';

export interface ServicePageViewProps {
    service: PlatformService;
    /** Загруженные кадры раздела: от них зависит и раскладка секций. */
    media: ShotMediaMap;
}

/** Страница сервиса: первый экран, секции по порядку, заявка на демо. */
export function ServicePageView({ service, media }: ServicePageViewProps) {
    return (
        <>
            <ServiceHero service={service} media={media} />
            {buildServiceBlocks(service, media).map(block => (
                <ServiceBlockSection key={block.kind} service={service} block={block} media={media} />
            ))}
            <DemoRequestSection />
        </>
    );
}
