'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { afterPresentationActions } from '../../model/AfterPresentationSlice';
import {
    closeCheckPresentation,
    submitCheckPresentation,
} from '../../model/AfterPresentationThunk';
import type {
    CheckPresentationItem,
    CheckPresentationValue,
} from '../../type/check-presentation-type';
import { getMissingRequiredIds } from '../check-presentation.validation';
import { isFiveKCode } from '../check-presentation.groups';

export interface CheckPresentationView {
    isActive: boolean;
    /** Вопросы разговора (обязательные xo_* и «Хвост»), по порядку. */
    talkItems: CheckPresentationItem[];
    /** Вопросы «Пять К», по порядку. */
    fiveKItems: CheckPresentationItem[];
    answers: Record<string, CheckPresentationValue>;
    /** Обязательные, на которые не ответили (подсветка после «Сохранить»). */
    missingIds: string[];
    /** Идёт запись ответов на портал. */
    isSaving: boolean;
    /** Ответы не записались (полностью или частично). */
    persistError: string | null;
    setAnswer: (id: string, value: CheckPresentationValue) => void;
    close: () => void;
    save: () => void;
}

/**
 * Состояние окна опросника: подписки, валидация обязательных и сохранение.
 *
 * «Сохранить» ЖДЁТ ответ портала: окно закрывается только после удачной
 * записи (см. submitCheckPresentation) — раньше оно закрывалось сразу, а
 * ошибка записи уходила в консоль.
 */
export const useCheckPresentation = (): CheckPresentationView => {
    const dispatch = useAppDispatch();
    const isActive = useAppSelector(s => s.afterPresentation.isActive);
    const items = useAppSelector(
        s => s.afterPresentation.checkPresentation.items,
    );
    const answers = useAppSelector(
        s => s.afterPresentation.checkPresentation.answers,
    );
    const persistError = useAppSelector(s => s.afterPresentation.persistError);
    const [missingIds, setMissingIds] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const close = () => {
        setMissingIds([]);
        dispatch(closeCheckPresentation());
    };

    const save = async () => {
        const missing = getMissingRequiredIds(items, answers);
        setMissingIds(missing);
        if (missing.length) return;
        setIsSaving(true);
        await dispatch(submitCheckPresentation());
        setIsSaving(false);
    };

    return {
        isActive,
        talkItems: sorted.filter(item => !isFiveKCode(item.code)),
        fiveKItems: sorted.filter(item => isFiveKCode(item.code)),
        answers,
        missingIds,
        isSaving,
        persistError,
        setAnswer: (id, value) =>
            dispatch(afterPresentationActions.setAnswer({ id, value })),
        close,
        save: () => void save(),
    };
};
