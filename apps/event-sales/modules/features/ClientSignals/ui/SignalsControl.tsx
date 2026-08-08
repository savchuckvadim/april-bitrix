'use client';

import { FC } from 'react';
import { Mail, Phone, Plus } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { getSignalsTarget } from '../lib/signal-selectors';
import { clientSignalsActions } from '../model/ClientSignalsSlice';
import type { SignalKind } from '../lib/signal-validate';
import { SignalEditor } from './SignalEditor';

interface SignalsControlProps {
    /** Тонкая строка: значок + первое значение, весь список — в тултипе. */
    compact?: boolean;
}

/**
 * Точки связи лида-носителя: телефоны и email. Носитель — собственный лид
 * или связанный лид сделки без компании; носителя нет — контрол не
 * рендерится. Списки не занимают место: всё, что есть, видно в тултипе.
 */
export const SignalsControl: FC<SignalsControlProps> = ({
    compact = false,
}) => {
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

    const chip = (kind: SignalKind, values: string[]) => {
        const isPhone = kind === 'phone';
        const Icon = isPhone ? Phone : Mail;
        const word = isPhone ? 'телефон' : 'email';

        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        type="button"
                        onClick={() => open(kind)}
                        className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                        <Icon aria-hidden className="size-3" />
                        {values.length ? (
                            <>
                                <span className="max-w-32 truncate">
                                    {values[0]}
                                </span>
                                {values.length > 1 && (
                                    <span className="text-muted-foreground/70">
                                        +{values.length - 1}
                                    </span>
                                )}
                            </>
                        ) : (
                            <>
                                <Plus aria-hidden className="size-3" />
                                {word}
                            </>
                        )}
                    </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start">
                    <p className="text-primary-foreground/70">
                        {isPhone ? 'Телефоны лида' : 'Email лида'}
                    </p>
                    {values.length ? (
                        values.map(value => (
                            <p key={value} className="font-medium">
                                {value}
                            </p>
                        ))
                    ) : (
                        <p className="font-medium">не заполнено</p>
                    )}
                    <p className="text-primary-foreground/70">
                        Нажмите, чтобы добавить
                    </p>
                </TooltipContent>
            </Tooltip>
        );
    };

    if (compact) {
        if (editor) return <SignalEditor />;
        return (
            <div className="flex items-center gap-3">
                {chip('phone', phones)}
                {chip('email', emails)}
            </div>
        );
    }

    return (
        <div className="flex min-w-0 flex-col gap-1">
            {!editor && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {chip('phone', phones)}
                    {chip('email', emails)}
                </div>
            )}
            <SignalEditor />
        </div>
    );
};
