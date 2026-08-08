'use client';

import { FC } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getSignalsTarget } from '../lib/signal-selectors';
import { clientSignalsActions } from '../model/ClientSignalsSlice';
import type { SignalKind } from '../lib/signal-validate';
import { SignalEditor } from './SignalEditor';

/**
 * Точки связи лида-носителя в шапке: телефоны и email со счётчиком
 * дополнительных + кнопки добавления. Носитель — собственный лид или
 * связанный лид сделки без компании; носителя нет — контрол не рендерится.
 */
export const SignalsControl: FC = () => {
    const dispatch = useAppDispatch();
    const target = useAppSelector(getSignalsTarget);
    const editor = useAppSelector(s => s.clientSignals.editor);
    const addedPhones = useAppSelector(s => s.clientSignals.addedPhones);
    const addedEmails = useAppSelector(s => s.clientSignals.addedEmails);

    if (!target) return null;

    const phones = [...target.phones, ...addedPhones];
    const emails = [...target.emails, ...addedEmails];
    const open = (kind: SignalKind) =>
        dispatch(clientSignalsActions.setEditor({ kind }));

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {!editor && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                    <button
                        type="button"
                        onClick={() => open('phone')}
                        className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                        <Phone aria-hidden className="size-3" />
                        {phones.length ? (
                            <span className="font-medium">
                                {phones[0]}
                                {phones.length > 1 && ` +${phones.length - 1}`}
                            </span>
                        ) : (
                            <>
                                <Plus aria-hidden className="size-3" />
                                телефон
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => open('email')}
                        className="inline-flex cursor-pointer items-center gap-1 text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                    >
                        <Mail aria-hidden className="size-3" />
                        {emails.length ? (
                            <span className="font-medium">
                                {emails[0]}
                                {emails.length > 1 && ` +${emails.length - 1}`}
                            </span>
                        ) : (
                            <>
                                <Plus aria-hidden className="size-3" />
                                email
                            </>
                        )}
                    </button>
                </div>
            )}
            <SignalEditor />
        </div>
    );
};
