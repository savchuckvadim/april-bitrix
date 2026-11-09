import { Check, Mail, Phone } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import {
    VENDOR_EMAIL,
    VENDOR_PHONE,
    VENDOR_PHONE_HREF,
} from '@/app/(site)/legal/constants/vendor';
import { SUPPORT_SCHEDULE } from '@/app/(site)/support/constants/support';
import { DEMO_FORM_COPY } from '../model/copy';
import { PLATFORM_ANCHORS } from '../model/navigation';
import { DemoRequestForm } from './DemoRequestForm';
import { PlatformSection } from './PlatformSection';

/** Финальная секция каждой страницы: заявка на демо и прямые контакты. */
export function DemoRequestSection() {
    return (
        <PlatformSection
            id={PLATFORM_ANCHORS.demo}
            eyebrow={DEMO_FORM_COPY.eyebrow}
            title={DEMO_FORM_COPY.title}
            lead={DEMO_FORM_COPY.lead}
            tone="muted"
        >
            <div className="grid gap-8 lg:grid-cols-[3fr_2fr]">
                <Card className="py-0">
                    <CardContent className="p-6 sm:p-8">
                        <DemoRequestForm />
                    </CardContent>
                </Card>
                <div className="flex flex-col gap-8">
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-foreground">
                            {DEMO_FORM_COPY.agendaTitle}
                        </h3>
                        <ul className="flex flex-col gap-3">
                            {DEMO_FORM_COPY.agenda.map(item => (
                                <li key={item} className="flex gap-3 text-muted-foreground">
                                    <Check className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-foreground">
                            {DEMO_FORM_COPY.contactsTitle}
                        </h3>
                        <div className="flex flex-col gap-3">
                            <a href={VENDOR_PHONE_HREF} className="flex items-center gap-3 text-foreground hover:text-primary">
                                <Phone className="size-5 text-primary" aria-hidden />
                                {VENDOR_PHONE}
                            </a>
                            <a href={`mailto:${VENDOR_EMAIL}`} className="flex items-center gap-3 text-foreground hover:text-primary">
                                <Mail className="size-5 text-primary" aria-hidden />
                                {VENDOR_EMAIL}
                            </a>
                            <p className="text-sm text-muted-foreground">{SUPPORT_SCHEDULE}</p>
                        </div>
                    </div>
                </div>
            </div>
        </PlatformSection>
    );
}
