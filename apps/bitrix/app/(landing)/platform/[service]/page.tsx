import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServicePageView } from '../components/ServicePageView';
import { fetchPlatformMedia } from '../lib/platform-media';
import { platformServiceHref } from '../model/navigation';
import { findPlatformService } from '../model/services';
import { PLATFORM_SERVICE_SLUGS } from '../model/types';

interface ServicePageParams {
    params: Promise<{ service: string }>;
}

/** Страницы сервисов собираются при сборке; чужой адрес — 404. */
export const dynamicParams = false;

/**
 * Раз в минуту страница сверяет загруженные в админке кадры (ISR) — как
 * PLATFORM_MEDIA_REVALIDATE_SECONDS; Next требует здесь литерал.
 */
export const revalidate = 60;

export function generateStaticParams(): { service: string }[] {
    return PLATFORM_SERVICE_SLUGS.map(service => ({ service }));
}

export async function generateMetadata({ params }: ServicePageParams): Promise<Metadata> {
    const service = findPlatformService((await params).service);
    if (!service) return {};
    return {
        title: service.seo.title,
        description: service.seo.description,
        alternates: { canonical: platformServiceHref(service.slug) },
        openGraph: {
            title: service.seo.title,
            description: service.seo.description,
            type: 'website',
        },
    };
}

export default async function PlatformServicePage({ params }: ServicePageParams) {
    const service = findPlatformService((await params).service);
    if (!service) notFound();
    const media = await fetchPlatformMedia();
    return <ServicePageView service={service} media={media} />;
}
