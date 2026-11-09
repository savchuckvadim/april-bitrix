'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { PLATFORM_COPY } from '../platform/model/copy';
import { PLATFORM_HEADER_LINKS } from '../platform/model/navigation';
import { DemoButton } from '../platform/components/DemoButton';
import { PlatformContainer } from '../platform/components/PlatformContainer';
import { useMobileMenu } from '../hooks/use-mobile-menu';
import { LandingLogo } from './LandingLogo';
import { LandingMobileMenu } from './LandingMobileMenu';
import { LandingServicesMenu } from './LandingServicesMenu';

/**
 * Шапка продающего раздела. Своя, а не хедер /home: у того навигация —
 * якоря главной, здесь — сервисы. `sticky`, чтобы контент всегда начинался
 * под шапкой без магических отступов.
 */
export function LandingHeader() {
    const menu = useMobileMenu();

    return (
        <header className="no-print sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <PlatformContainer className="flex h-16 items-center justify-between gap-6">
                <LandingLogo />
                <nav className="hidden items-center gap-8 lg:flex">
                    <LandingServicesMenu />
                    {PLATFORM_HEADER_LINKS.map(link => (
                        <Link key={link.href} href={link.href} className="text-sm font-medium text-foreground hover:text-primary">
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <DemoButton className="hidden h-10 lg:inline-flex" />
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={menu.toggle}
                    aria-expanded={menu.isOpen}
                    aria-label={menu.isOpen ? PLATFORM_COPY.closeMenu : PLATFORM_COPY.openMenu}
                >
                    {menu.isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </Button>
            </PlatformContainer>
            {menu.isOpen && <LandingMobileMenu onNavigate={menu.close} />}
        </header>
    );
}
