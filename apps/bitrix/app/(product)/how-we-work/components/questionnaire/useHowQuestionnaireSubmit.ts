'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    HowQuestionnaire,
    HowQuestionnaireState,
    HowQuestionnaireSubmit,
} from '../../constants/types';
import {
    buildSubmission,
    fingerprintState,
    validateSubmission,
} from '../../lib/build-submission';
import { submitProtocol } from '../../lib/submit-protocol';

export type HowSubmitStatus = 'idle' | 'sending' | 'sent' | 'error';

const sentKey = (id: string) => `how-questionnaire-${id}-sent`;

const readSentFingerprint = (id: string): string => {
    try {
        return localStorage.getItem(sentKey(id)) ?? '';
    } catch {
        return '';
    }
};

const writeSentFingerprint = (id: string, value: string): void => {
    try {
        localStorage.setItem(sentKey(id), value);
    } catch {
        // приватный режим — защита от повтора живёт только в памяти
    }
};

/**
 * Отправка протокола нам: состояние запроса, сообщение для пользователя,
 * honeypot и защита от повторной отправки того же заполнения — отпечаток
 * отправленного хранится в localStorage; изменил ответы — можно слать снова.
 */
export const useHowQuestionnaireSubmit = (
    questionnaire: HowQuestionnaire,
    submit: HowQuestionnaireSubmit,
    state: HowQuestionnaireState,
) => {
    const [status, setStatus] = useState<HowSubmitStatus>('idle');
    const [message, setMessage] = useState('');
    const [website, setWebsite] = useState('');
    const [sentFingerprint, setSentFingerprint] = useState('');

    useEffect(() => {
        setSentFingerprint(readSentFingerprint(questionnaire.id));
    }, [questionnaire.id]);

    const currentFingerprint = fingerprintState(state);
    const alreadySent =
        Boolean(sentFingerprint) && sentFingerprint === currentFingerprint;

    useEffect(() => {
        if (status === 'sent' && !alreadySent) {
            setStatus('idle');
            setMessage('');
        }
    }, [alreadySent, status]);

    const send = useCallback(async () => {
        if (status === 'sending' || alreadySent) return;
        const error = validateSubmission(questionnaire, submit, state);
        if (error) {
            setStatus('error');
            setMessage(error);
            return;
        }
        setStatus('sending');
        setMessage('');
        const result = await submitProtocol(
            submit.path,
            buildSubmission(questionnaire, submit, state, website),
        );
        if (!result.ok) {
            setStatus('error');
            setMessage(result.error);
            return;
        }
        writeSentFingerprint(questionnaire.id, currentFingerprint);
        setSentFingerprint(currentFingerprint);
        setStatus('sent');
        setMessage('Бриф отправлен — мы свяжемся с вами.');
    }, [
        alreadySent,
        currentFingerprint,
        questionnaire,
        state,
        status,
        submit,
        website,
    ]);

    return {
        status: alreadySent && status !== 'sending' ? 'sent' : status,
        message,
        website,
        setWebsite,
        send,
    };
};
