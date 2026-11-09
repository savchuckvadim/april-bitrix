import Link from 'next/link';
import { PLATFORM_COPY } from '../platform/model/copy';
import {
    PLATFORM_PAGE_LINKS,
    platformServiceHref,
} from '../platform/model/navigation';
import { PLATFORM_SERVICES } from '../platform/model/services';
import { DemoButton } from '../platform/components/DemoButton';
import { PlatformContainer } from '../platform/components/PlatformContainer';

export interface LandingMobileMenuProps {
    onNavigate: () => void;
}

/** Меню на телефоне: сервисы списком, разделы главной, заявка. */
export function LandingMobileMenu({ onNavigate }: LandingMobileMenuProps) {
    return (
        <div className="border-t border-border bg-background lg:hidden">
            <PlatformContainer className="py-4">
                <nav className="flex flex-col gap-1">
                    <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {PLATFORM_COPY.servicesMenu}
                    </p>
                    {PLATFORM_SERVICES.map(service => (
                        <Link
                            key={service.slug}
                            href={platformServiceHref(service.slug)}
                            onClick={onNavigate}
                            className="rounded-lg px-2 py-2 text-foreground hover:bg-accent"
                        >
                            {service.name}
                        </Link>
                    ))}
                    <div className="my-2 h-px bg-border" />
                    {PLATFORM_PAGE_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onNavigate}
                            className="rounded-lg px-2 py-2 text-foreground hover:bg-accent"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="pt-3">
                        <DemoButton className="w-full" onClick={onNavigate} />
                    </div>
                </nav>
            </PlatformContainer>
        </div>
    );
}
