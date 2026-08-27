'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '../../model/EventCompanyThunk';
import type { CompanyColorType } from '../../utils/event-company-util';
import {
    getProspectCaption,
    getProspectName,
    getProspectSteps,
    type ProspectStepView,
} from '../../utils/prospect-scale-view';

export interface ProspectScaleView {
    /** Поле прогноза есть на портале — иначе шкалу не рисуем вовсе. */
    hasField: boolean;
    steps: ProspectStepView[];
    /** Код текущего значения; null — прогноз не задан. */
    current: CompanyColorType | null;
    /** «Сейчас: X → Y» либо текст ошибки записи. */
    caption: string;
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

    return {
        hasField: Boolean(color.field),
        steps: getProspectSteps(color.items),
        current,
        caption: getProspectCaption({
            error: color.error,
            currentName: getProspectName(color.items, current),
            previewName: getProspectName(color.items, previewCode),
        }),
        isCaptionError: Boolean(color.error),
        isLoading: color.isLoading,
        select: code => dispatch(setCurrentColor(code as CompanyColorType)),
        setPreview,
    };
};
