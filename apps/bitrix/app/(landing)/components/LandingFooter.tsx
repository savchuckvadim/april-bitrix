import Link from 'next/link';
import {
    VENDOR_EMAIL,
    VENDOR_PHONE,
    VENDOR_PHONE_HREF,
} from '@/app/(site)/legal/constants/vendor';
import { SUPPORT_SCHEDULE, SUPPORT_VENDOR } from '@/app/(site)/support/constants/support';
import { PLATFORM_COPY } from '../platform/model/copy';
import {
    PLATFORM_FOOTER_LINKS,
    platformServiceHref,
} from '../platform/model/navigation';
import { PLATFORM_SERVICES } from '../platform/model/services';
import { PlatformContainer } from '../platform/components/PlatformContainer';
import { LandingLogo } from './LandingLogo';

/** Подвал раздела: сервисы, документы, контакты и реквизиты вендора. */
export function LandingFooter() {
    return (
        <footer className="no-print border-t border-border bg-muted/20">
            <PlatformContainer className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-4">
                    <LandingLogo />
                    <p className="text-sm text-muted-foreground">{PLATFORM_COPY.footerPitch}</p>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">{PLATFORM_COPY.footerServices}</h2>
                    <ul className="flex flex-col gap-2 text-sm">
                        {PLATFORM_SERVICES.map(service => (
                            <li key={service.slug}>
                                <Link href={platformServiceHref(service.slug)} className="text-muted-foreground hover:text-primary">
                                    {service.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">{PLATFORM_COPY.footerCompany}</h2>
                    <ul className="flex flex-col gap-2 text-sm">
                        {PLATFORM_FOOTER_LINKS.map(link => (
                            <li key={link.href}>
                                <Link href={link.href} className="text-muted-foreground hover:text-primary">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2 className="mb-4 text-sm font-semibold text-foreground">{PLATFORM_COPY.footerContacts}</h2>
                    <div className="flex flex-col gap-2 text-sm">
                        <a href={VENDOR_PHONE_HREF} className="text-foreground hover:text-primary">
                            {VENDOR_PHONE}
                        </a>
                        <a href={`mailto:${VENDOR_EMAIL}`} className="text-foreground hover:text-primary">
                            {VENDOR_EMAIL}
                        </a>
                        <p className="text-muted-foreground">{SUPPORT_SCHEDULE}</p>
                        <p className="text-muted-foreground">{SUPPORT_VENDOR}</p>
                    </div>
                </div>
            </PlatformContainer>
        </footer>
    );
}
