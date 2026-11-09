import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { PLATFORM_COPY } from '../model/copy';
import { platformServiceHref } from '../model/navigation';
import type { PlatformService } from '../model/types';
import { SERVICE_ICONS } from '../lib/service-icons';

export interface ServiceCardProps {
    service: PlatformService;
}

/** Карточка сервиса: выгода крупно, название — подписью, вся карточка — ссылка. */
export function ServiceCard({ service }: ServiceCardProps) {
    const Icon = SERVICE_ICONS[service.slug];
    return (
        <Link href={platformServiceHref(service.slug)} className="group block h-full">
            <Card className="h-full py-0 transition-colors group-hover:border-primary/60">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                            <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="text-sm font-semibold text-muted-foreground">{service.name}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{service.card.title}</h3>
                    <p className="flex-grow text-pretty text-muted-foreground">{service.card.text}</p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        {PLATFORM_COPY.serviceMore}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                    </span>
                </CardContent>
            </Card>
        </Link>
    );
}
