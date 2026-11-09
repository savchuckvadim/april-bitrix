'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { PLATFORM_COPY } from '../platform/model/copy';
import { platformServiceHref } from '../platform/model/navigation';
import { PLATFORM_SERVICES } from '../platform/model/services';
import { SERVICE_ICONS } from '../platform/lib/service-icons';

/** Выпадающий список сервисов в шапке (десктоп). */
export function LandingServicesMenu() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1 text-sm font-medium text-foreground outline-none hover:text-primary">
                {PLATFORM_COPY.servicesMenu}
                <ChevronDown className="size-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80">
                {PLATFORM_SERVICES.map(service => {
                    const Icon = SERVICE_ICONS[service.slug];
                    return (
                        <DropdownMenuItem key={service.slug} asChild>
                            <Link href={platformServiceHref(service.slug)} className="flex items-start gap-3 py-2">
                                <Icon className="mt-0.5 size-4 text-primary" aria-hidden />
                                <span className="flex flex-col">
                                    <span className="font-medium text-foreground">{service.name}</span>
                                    <span className="text-xs text-muted-foreground">{service.card.title}</span>
                                </span>
                            </Link>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
