'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    HowAnswer,
    HowProtocolAttachment,
    HowQuestionnaire,
    HowQuestionnaireState,
} from '../../constants/types';
import {
    buildProtocol,
    downloadDataUrl,
    downloadText,
} from '../../lib/build-protocol';

const EMPTY_STATE: HowQuestionnaireState = {
    respondent: '',
    company: '',
    answers: {},
};

const storageKey = (id: string) => `how-questionnaire-${id}`;

/**
 * Состояние заполнения анкеты: ответы, автосохранение в localStorage,
 * прогресс и выгрузка протокола. `getAttachments` — необязательный сборщик
 * приложений (PNG-схем): они скачиваются вместе с протоколом и
 * перечисляются в его тексте.
 */
export const useHowQuestionnaire = (
    questionnaire: HowQuestionnaire,
    getAttachments?: () => Promise<HowProtocolAttachment[]>,
) => {
    const [state, setState] = useState<HowQuestionnaireState>(EMPTY_STATE);
    const [status, setStatus] = useState('');
    const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        },
        [],
    );

    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey(questionnaire.id));
            if (raw) setState(JSON.parse(raw) as HowQuestionnaireState);
        } catch {
            // повреждённое хранилище — начинаем с чистого состояния
        }
    }, [questionnaire.id]);

    const persist = useCallback(
        (next: HowQuestionnaireState) => {
            setState(next);
            try {
                localStorage.setItem(
                    storageKey(questionnaire.id),
                    JSON.stringify(next),
                );
            } catch {
                // приватный режим — работаем без сохранения
            }
        },
        [questionnaire.id],
    );

    const setRespondent = useCallback(
        (respondent: string) => persist({ ...state, respondent }),
        [persist, state],
    );

    const setCompany = useCallback(
        (company: string) => persist({ ...state, company }),
        [persist, state],
    );

    const setAnswer = useCallback(
        (questionId: string, patch: Partial<HowAnswer>) => {
            const current = state.answers[questionId] ?? {};
            persist({
                ...state,
                answers: {
                    ...state.answers,
                    [questionId]: { ...current, ...patch },
                },
            });
        },
        [persist, state],
    );

    const toggleChoice = useCallback(
        (questionId: string, value: string) => {
            const current = state.answers[questionId]?.choice;
            setAnswer(questionId, {
                choice: current === value ? undefined : value,
                custom: undefined,
            });
        },
        [setAnswer, state.answers],
    );

    const answeredCount = useMemo(
        () =>
            questionnaire.questions.filter((question) => {
                const answer = state.answers[question.id];
                return Boolean(answer?.choice || answer?.custom?.trim());
            }).length,
        [questionnaire.questions, state.answers],
    );

    const flash = useCallback((message: string) => {
        setStatus(message);
        if (statusTimerRef.current) clearTimeout(statusTimerRef.current);
        statusTimerRef.current = setTimeout(() => setStatus(''), 4000);
    }, []);

    const download = useCallback(async () => {
        let attachments: HowProtocolAttachment[] = [];
        try {
            attachments = (await getAttachments?.()) ?? [];
        } catch {
            // схемы не собрались — протокол важнее
        }
        downloadText(
            `${questionnaire.id}-protocol.txt`,
            buildProtocol(questionnaire, state, attachments),
        );
        attachments.forEach((attachment) =>
            downloadDataUrl(attachment.fileName, attachment.dataUrl),
        );
        flash(
            attachments.length
                ? `Протокол и схемы (${attachments.length}) сохранены — пришлите их нам.`
                : 'Файл сохранён — пришлите его нам.',
        );
    }, [flash, getAttachments, questionnaire, state]);

    const copy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(
                buildProtocol(questionnaire, state),
            );
            flash('Протокол скопирован — вставьте его в письмо или чат.');
        } catch {
            flash('Буфер обмена недоступен — используйте скачивание.');
        }
    }, [flash, questionnaire, state]);

    const reset = useCallback(() => {
        persist(EMPTY_STATE);
        flash('Ответы сброшены.');
    }, [flash, persist]);

    return {
        state,
        status,
        answeredCount,
        setRespondent,
        setCompany,
        setAnswer,
        toggleChoice,
        download,
        copy,
        reset,
    };
};
