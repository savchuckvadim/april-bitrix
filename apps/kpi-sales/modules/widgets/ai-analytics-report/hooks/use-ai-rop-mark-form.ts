'use client';

import { useCallback, useState } from 'react';
import type {
    AiRopMark,
    AiRopMarkCall,
    AiRopMarkInput,
    AiRopMarkSection,
    AiRopMarkWeekQuery,
} from '@/modules/entities/ai-analytics';
import {
    aiRopMarkFormFromMark,
    buildAiRopMarkInput,
    clampAiRopMarkText,
    emptyAiRopMarkForm,
    toggleAiRopMarkSection,
    validateAiRopMarkForm,
    type AiRopMarkFormValues,
} from '../lib/ai-rop-mark.util';

interface UseAiRopMarkFormOptions {
    call: AiRopMarkCall;
    /** Неделя списка на экране — уходит в save той же неделей. */
    query: AiRopMarkWeekQuery | null;
    onSave: (input: AiRopMarkInput) => Promise<boolean>;
}

const initialForm = (mark: AiRopMark | undefined): AiRopMarkFormValues =>
    mark ? aiRopMarkFormFromMark(mark) : emptyAiRopMarkForm();

/**
 * Форма метки по одному звонку подбора: значения, режим редактирования
 * (без метки — сразу форма; с меткой — показ и «Изменить»), проверка на
 * отправку (ошибка видна только после попытки), тело save через
 * buildAiRopMarkInput. Успех — по ответу бэка: форма закрывается.
 */
export const useAiRopMarkForm = ({
    call,
    query,
    onSave,
}: UseAiRopMarkFormOptions) => {
    const [form, setForm] = useState<AiRopMarkFormValues>(() =>
        initialForm(call.mark),
    );
    const [editing, setEditing] = useState(!call.marked);
    const [touched, setTouched] = useState(false);
    const validation = validateAiRopMarkForm(form);

    const patch = useCallback(
        (update: Partial<AiRopMarkFormValues>) =>
            setForm(prev => ({ ...prev, ...update })),
        [],
    );
    const setAgree = useCallback((agree: boolean) => patch({ agree }), [patch]);
    const setScore = useCallback(
        (ropScore: number | null) => patch({ ropScore }),
        [patch],
    );
    const toggleSection = useCallback(
        (code: AiRopMarkSection) =>
            setForm(prev => ({
                ...prev,
                sections: toggleAiRopMarkSection(prev.sections, code),
            })),
        [],
    );
    const setWhy = useCallback(
        (why: string) => patch({ why: clampAiRopMarkText(why) }),
        [patch],
    );
    const setHowTo = useCallback(
        (howTo: string) => patch({ howTo: clampAiRopMarkText(howTo) }),
        [patch],
    );

    /** Повторная метка: стартуем с сохранённых значений. */
    const startEdit = useCallback(() => {
        setForm(initialForm(call.mark));
        setTouched(false);
        setEditing(true);
    }, [call.mark]);

    const cancelEdit = useCallback(() => {
        setEditing(false);
        setTouched(false);
    }, []);

    const submit = useCallback(async (): Promise<boolean> => {
        setTouched(true);
        const input = buildAiRopMarkInput(
            call.transcriptionId,
            form,
            query ?? {},
        );
        if (!input) return false;
        const ok = await onSave(input);
        if (ok) {
            setEditing(false);
            setTouched(false);
        }
        return ok;
    }, [call.transcriptionId, form, onSave, query]);

    return {
        form,
        editing,
        /** Отмена есть только у повторной метки — без метки форма обязательна. */
        canCancel: call.marked,
        error: touched ? validation : null,
        setAgree,
        setScore,
        toggleSection,
        setWhy,
        setHowTo,
        startEdit,
        cancelEdit,
        submit,
    };
};
