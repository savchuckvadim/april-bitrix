import { CheckCircle2 } from 'lucide-react';
import { VENDOR_PHONE, VENDOR_PHONE_HREF } from '@/app/(site)/legal/constants/vendor';
import { DEMO_FORM_COPY } from '../model/copy';

/** Экран после отправки: заявка дошла до нас, что будет дальше. */
export function DemoRequestSent() {
    return (
        <div role="status" className="flex flex-col items-start gap-3 py-6">
            <CheckCircle2 className="size-10 text-success" aria-hidden />
            <p className="text-xl font-semibold text-foreground">{DEMO_FORM_COPY.sentTitle}</p>
            <p className="text-muted-foreground">
                {DEMO_FORM_COPY.sentText}{' '}
                <a href={VENDOR_PHONE_HREF} className="font-medium text-primary hover:underline">
                    {VENDOR_PHONE}
                </a>
            </p>
        </div>
    );
}
