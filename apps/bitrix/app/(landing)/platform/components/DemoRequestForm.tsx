'use client';

import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import { VENDOR_PHONE, VENDOR_PHONE_HREF } from '@/app/(site)/legal/constants/vendor';
import { DEMO_FORM_COPY } from '../model/copy';
import { useDemoRequestForm } from '../hooks/use-demo-request-form';
import { DemoRequestField } from './DemoRequestField';
import { DemoRequestHoneypot } from './DemoRequestHoneypot';
import { DemoRequestSent } from './DemoRequestSent';

/** Форма заявки на демо: четыре поля и согласие, без лишних вопросов. */
export function DemoRequestForm() {
    const { values, errors, status, isSending, setText, setConsent, submit } =
        useDemoRequestForm();

    if (status === 'sent') return <DemoRequestSent />;

    return (
        <form onSubmit={submit} noValidate className="relative flex flex-col gap-5">
            <DemoRequestHoneypot />
            <div className="grid gap-5 sm:grid-cols-2">
                <DemoRequestField id="demo-name" label={DEMO_FORM_COPY.name} required error={errors.name}>
                    <Input
                        id="demo-name"
                        autoComplete="name"
                        value={values.name}
                        onChange={event => setText('name', event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'demo-name-error' : undefined}
                    />
                </DemoRequestField>
                <DemoRequestField id="demo-phone" label={DEMO_FORM_COPY.phone} required error={errors.phone}>
                    <Input
                        id="demo-phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={values.phone}
                        onChange={event => setText('phone', event.target.value)}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'demo-phone-error' : undefined}
                    />
                </DemoRequestField>
            </div>
            <DemoRequestField id="demo-company" label={DEMO_FORM_COPY.company}>
                <Input
                    id="demo-company"
                    autoComplete="organization"
                    value={values.company}
                    onChange={event => setText('company', event.target.value)}
                />
            </DemoRequestField>
            <DemoRequestField id="demo-comment" label={DEMO_FORM_COPY.comment}>
                <Textarea
                    id="demo-comment"
                    rows={3}
                    placeholder={DEMO_FORM_COPY.commentPlaceholder}
                    value={values.comment}
                    onChange={event => setText('comment', event.target.value)}
                />
            </DemoRequestField>
            <div className="flex flex-col gap-2">
                <div className="flex items-start gap-3">
                    <Checkbox
                        id="demo-consent"
                        checked={values.consent}
                        onCheckedChange={checked => setConsent(checked === true)}
                        aria-invalid={Boolean(errors.consent)}
                        className="mt-0.5"
                    />
                    <label htmlFor="demo-consent" className="text-sm text-muted-foreground">
                        {DEMO_FORM_COPY.consentBefore}
                        <Link href="/legal/site-privacy" className="text-primary hover:underline">
                            {DEMO_FORM_COPY.consentLink}
                        </Link>
                    </label>
                </div>
                {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
            </div>
            {status === 'failed' && (
                <p role="alert" className="text-sm text-destructive">
                    {DEMO_FORM_COPY.failedText}{' '}
                    <a href={VENDOR_PHONE_HREF} className="font-medium underline">
                        {VENDOR_PHONE}
                    </a>
                </p>
            )}
            <Button type="submit" size="lg" disabled={isSending} className="h-12 self-start px-8 text-base">
                {isSending ? DEMO_FORM_COPY.sending : DEMO_FORM_COPY.submit}
            </Button>
        </form>
    );
}
