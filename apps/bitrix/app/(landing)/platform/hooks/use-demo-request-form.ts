import { useState } from 'react';
import type { FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import {
    DEMO_REQUEST_HONEYPOT,
    parseDemoRequest,
    type DemoRequestErrors,
} from '../model/demo-request';
import { PLATFORM_ROOT } from '../model/navigation';
import { sendDemoRequest } from '../lib/send-demo-request';

export type DemoRequestTextField = 'name' | 'phone' | 'company' | 'comment';

export type DemoRequestStatus = 'idle' | 'sending' | 'sent' | 'failed';

export interface DemoRequestValues {
    name: string;
    phone: string;
    company: string;
    comment: string;
    consent: boolean;
}

const EMPTY_VALUES: DemoRequestValues = {
    name: '',
    phone: '',
    company: '',
    comment: '',
    consent: false,
};

/** Состояние формы заявки: значения, ошибки полей, статус отправки. */
export function useDemoRequestForm() {
    const pathname = usePathname();
    const [values, setValues] = useState<DemoRequestValues>(EMPTY_VALUES);
    const [errors, setErrors] = useState<DemoRequestErrors>({});
    const [status, setStatus] = useState<DemoRequestStatus>('idle');

    const setText = (field: DemoRequestTextField, value: string) => {
        setValues(prev => ({ ...prev, [field]: value }));
        if (field === 'name' || field === 'phone') {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const setConsent = (consent: boolean) => {
        setValues(prev => ({ ...prev, consent }));
        setErrors(prev => ({ ...prev, consent: undefined }));
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const page = pathname ?? PLATFORM_ROOT;
        const parsed = parseDemoRequest({ ...values, page });
        if (!parsed.ok) {
            setErrors(parsed.errors);
            return;
        }
        // Ловушка неуправляемая: берём из формы то, что туда реально вписали.
        const website = String(new FormData(event.currentTarget).get(DEMO_REQUEST_HONEYPOT) ?? '');
        setStatus('sending');
        const result = await sendDemoRequest({ ...values, page, website });
        setStatus(result);
        if (result === 'sent') setValues(EMPTY_VALUES);
    };

    return {
        values,
        errors,
        status,
        isSending: status === 'sending',
        setText,
        setConsent,
        submit,
    };
}
