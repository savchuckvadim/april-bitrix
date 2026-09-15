'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Check, Loader2, Send } from 'lucide-react';
import {
    HowQuestionnaire as QuestionnaireData,
    HowQuestionnaireState,
    HowQuestionnaireSubmit as SubmitConfig,
} from '../../constants/types';
import { useHowQuestionnaireSubmit } from './useHowQuestionnaireSubmit';

interface HowQuestionnaireSubmitProps {
    questionnaire: QuestionnaireData;
    submit: SubmitConfig;
    state: HowQuestionnaireState;
}

const BUTTON_LABEL = {
    idle: 'Отправить нам',
    sending: 'Отправляем…',
    sent: 'Отправлено',
    error: 'Повторить',
} as const;

/**
 * Кнопка «Отправить нам» с состоянием отправки и honeypot-полем. Поле
 * `website` скрыто от людей (и от скринридеров), но доступно ботам —
 * непустое значение маршрут молча отбрасывает.
 */
export const HowQuestionnaireSubmit: React.FC<HowQuestionnaireSubmitProps> = ({
    questionnaire,
    submit,
    state,
}) => {
    const { status, message, website, setWebsite, send } =
        useHowQuestionnaireSubmit(questionnaire, submit, state);

    return (
        <>
            <input
                type="text"
                name="website"
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <Button
                variant="secondary"
                onClick={send}
                disabled={status === 'sending' || status === 'sent'}
            >
                {status === 'sending' && (
                    <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                )}
                {status === 'sent' && <Check className="mr-1.5 h-4 w-4" />}
                {(status === 'idle' || status === 'error') && (
                    <Send className="mr-1.5 h-4 w-4" />
                )}
                {BUTTON_LABEL[status]}
            </Button>
            {message && (
                <span
                    className={
                        status === 'error'
                            ? 'text-sm text-destructive'
                            : 'text-sm text-success'
                    }
                    role="status"
                >
                    {message}
                </span>
            )}
        </>
    );
};
