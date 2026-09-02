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
import type { SurveyBlockDraft } from '../check-presentation.blocks';
import { getMissingRequiredIds } from '../check-presentation.validation';
import { isFiveKCode } from '../check-presentation.groups';

export interface CheckPresentationView {
    isActive: boolean;
    /** Вопросы разговора («Хвост», итоги), по порядку. */
    talkItems: CheckPresentationItem[];
    /** Вопросы «Пять К», по порядку. */
    fiveKItems: CheckPresentationItem[];
    answers: Record<string, CheckPresentationValue>;
    /** Черновики блоков с подвопросами, ключ — id блока. */
    blocks: Record<string, SurveyBlockDraft>;
    /** Обязательные, на которые не ответили (подсветка после «Сохранить»). */
    missingIds: string[];
    /**
     * Прогноз по компании обязан быть выставлен в этой сессии
     * (просьба владельца 02.09: «прогноз — обязательно изменить»).
     * false — компании нет или поле прогноза не установлено.
     */
    isProspectRequired: boolean;
    /** Прогноз требуется, но менеджер его не трогал (после «Сохранить»). */
    isProspectMissing: boolean;
    /** Идёт запись ответов на портал. */
    isSaving: boolean;
    /** Ответы не записались (полностью или частично). */
    persistError: string | null;
    setAnswer: (id: string, value: CheckPresentationValue) => void;
    setBlockText: (id: string, text: string) => void;
    setBlockSub: (id: string, index: number, text: string) => void;
    setBlockExpanded: (id: string, expanded: boolean) => void;
    close: () => void;
    save: () => void;
}

/**
 * Состояние окна опросника: подписки, валидация обязательных и сохранение.
 *
 * «Сохранить» ЖДЁТ ответ портала: окно закрывается только после удачной
 * записи (см. submitCheckPresentation) — раньше оно закрывалось сразу, а
 * ошибка записи уходила в консоль.
 *
 * Прогноз по компании — часть итога презентации: после разговора цвет
 * клиента обязан быть осознанно выставлен. Выбор того же цвета — тоже
 * выбор: требуется факт нажатия в этой сессии (`color.isChanged`), а не
 * отличие от прошлого значения.
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
    const blocks = useAppSelector(
        s => s.afterPresentation.checkPresentation.blocks,
    );
    const persistError = useAppSelector(s => s.afterPresentation.persistError);
    const hasCompany = useAppSelector(s => Boolean(s.app.bitrix.company));
    const prospectField = useAppSelector(s => s.company.color.field);
    const prospectChanged = useAppSelector(s => s.company.color.isChanged);
    const [missingIds, setMissingIds] = useState<string[]>([]);
    const [isProspectMissing, setProspectMissing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isProspectRequired = hasCompany && Boolean(prospectField);
    const sorted = [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const close = () => {
        setMissingIds([]);
        setProspectMissing(false);
        dispatch(closeCheckPresentation());
    };

    const save = async () => {
        const missing = getMissingRequiredIds(items, answers);
        const prospectMissing = isProspectRequired && !prospectChanged;
        setMissingIds(missing);
        setProspectMissing(prospectMissing);
        if (missing.length || prospectMissing) return;
        setIsSaving(true);
        await dispatch(submitCheckPresentation());
        setIsSaving(false);
    };

    return {
        isActive,
        talkItems: sorted.filter(item => !isFiveKCode(item.code)),
        fiveKItems: sorted.filter(item => isFiveKCode(item.code)),
        answers,
        blocks,
        missingIds,
        isProspectRequired,
        // Гаснет само, как только прогноз выставили: ошибка держится только
        // до действия, а не до следующего «Сохранить».
        isProspectMissing: isProspectMissing && !prospectChanged,
        isSaving,
        persistError,
        setAnswer: (id, value) =>
            dispatch(afterPresentationActions.setAnswer({ id, value })),
        setBlockText: (id, text) =>
            dispatch(afterPresentationActions.setBlockText({ id, text })),
        setBlockSub: (id, index, text) =>
            dispatch(afterPresentationActions.setBlockSub({ id, index, text })),
        setBlockExpanded: (id, expanded) =>
            dispatch(afterPresentationActions.setBlockExpanded({ id, expanded })),
        close,
        save: () => void save(),
    };
};
