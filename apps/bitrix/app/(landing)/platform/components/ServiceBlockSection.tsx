import { PLATFORM_COPY } from '../model/copy';
import { getPlatformServices } from '../model/services';
import type { PlatformService } from '../model/types';
import type { ServiceBlock } from '../lib/service-blocks';
import { visibleShots } from '../lib/shot-visibility';
import { BenefitCards } from './BenefitCards';
import { FaqList } from './FaqList';
import { FeatureGroups } from './FeatureGroups';
import { PlatformSection } from './PlatformSection';
import { RoleColumns } from './RoleColumns';
import { ServiceGrid } from './ServiceGrid';
import { ServiceSteps } from './ServiceSteps';
import { ShotGallery } from './ShotGallery';

export interface ServiceBlockSectionProps {
    service: PlatformService;
    block: ServiceBlock;
}

/** Одна секция страницы сервиса по её виду из `buildServiceBlocks`. */
export function ServiceBlockSection({ service, block }: ServiceBlockSectionProps) {
    switch (block.kind) {
        case 'benefits':
            return (
                <PlatformSection title={service.benefits.title} tone={block.tone}>
                    <BenefitCards items={service.benefits.items} />
                </PlatformSection>
            );
        case 'steps':
            return (
                <PlatformSection title={service.steps.title} tone={block.tone}>
                    <ServiceSteps items={service.steps.items} />
                </PlatformSection>
            );
        case 'roles':
            return (
                <PlatformSection title={PLATFORM_COPY.rolesTitle} tone={block.tone}>
                    <RoleColumns roles={service.roles ?? []} />
                </PlatformSection>
            );
        case 'features':
            return (
                <PlatformSection title={PLATFORM_COPY.featuresTitle} tone={block.tone}>
                    <FeatureGroups groups={service.features} />
                </PlatformSection>
            );
        case 'gallery':
            return (
                <PlatformSection title={PLATFORM_COPY.galleryTitle} tone={block.tone}>
                    <ShotGallery shotIds={visibleShots(service.gallery)} />
                </PlatformSection>
            );
        case 'faq':
            return (
                <PlatformSection title={PLATFORM_COPY.faqTitle} tone={block.tone}>
                    <FaqList items={service.faq} />
                </PlatformSection>
            );
        case 'related':
            return (
                <PlatformSection title={PLATFORM_COPY.relatedTitle} tone={block.tone}>
                    <ServiceGrid services={getPlatformServices(service.related)} />
                </PlatformSection>
            );
    }
}
