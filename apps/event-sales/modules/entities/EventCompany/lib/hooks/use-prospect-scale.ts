'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '../../model/EventCompanyThunk';
import type { CompanyColorType } from '../../utils/event-company-util';
import {
    getProspectCaption,
    getProspectCaptionVariants,
    getProspectName,
    getProspectPreviewCaption,
    getProspectSteps,
    type ProspectStepView,
} from '../../utils/prospect-scale-view';

export interface ProspectScaleView {
    /** Поле прогноза есть на портале — иначе шкалу не рисуем вовсе. */
    hasField: boolean;
    steps: ProspectStepView[];
    /** Код текущего значения; null — прогноз не задан. */
    current: CompanyColorType | null;
    /** «Сейчас: X → Y» либо текст ошибки записи (окно предпроверки). */
    caption: string;
    /** «Сейчас: X» без превью — подпись шапки, ширина не скачет. */
    currentCaption: string;
    /** «Станет: Y» под курсором — плашка поверх шапки; null — нечего. */
    previewCaption: string | null;
    /** Все варианты «Сейчас: …» — шапка держит ширину по самому длинному. */
    captionVariants: string[];
    isCaptionError: boolean;
    isLoading: boolean;
    select: (code: string) => void;
    /** Ступень под курсором/клавиатурным фокусом (для подписи). */
    setPreview: (code: string | null) => void;
}

/**
 * Данные шкалы прогноза для UI: значение, ступени, подпись и колбэки.
 *
 * Превью («что станет при клике») живёт здесь, а не в сторе: это состояние
 * указателя, а не данных — записывать его в redux незачем.
 */
export const useProspectScale = (): ProspectScaleView => {
    const dispatch = useAppDispatch();
    const color = useAppSelector(s => s.company.color);
    const [previewCode, setPreview] = useState<string | null>(null);

    const current = (color.current?.code as CompanyColorType | null) ?? null;
    const steps = getProspectSteps(color.items);
    const captionInput = {
        error: color.error,
        currentName: getProspectName(color.items, current),
        previewName: getProspectName(color.items, previewCode),
    };

    return {
        hasField: Boolean(color.field),
        steps,
        current,
        caption: getProspectCaption(captionInput),
        currentCaption: getProspectCaption({
            ...captionInput,
            previewName: undefined,
        }),
        previewCaption: getProspectPreviewCaption(captionInput),
        captionVariants: getProspectCaptionVariants(steps),
        isCaptionError: Boolean(color.error),
        isLoading: color.isLoading,
        select: code => dispatch(setCurrentColor(code as CompanyColorType)),
        setPreview,
    };
};
