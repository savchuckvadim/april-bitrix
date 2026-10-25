'use client';

import { useState } from 'react';
import {
    buildProspectScaleView,
    type ProspectScaleView as ProspectScaleBaseView,
} from '@workspace/april-ui/entity';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { setCurrentColor } from '../../model/EventCompanyThunk';
import type { CompanyColorType } from '../../utils/event-company-util';

export interface ProspectScaleView extends ProspectScaleBaseView {
    /** Поле прогноза есть на портале — иначе шкалу не рисуем вовсе. */
    hasField: boolean;
    select: (code: string) => void;
    /** Ступень под курсором/клавиатурным фокусом (для подписи). */
    setPreview: (code: string | null) => void;
}

/**
 * Данные шкалы прогноза для UI: значение, ступени, подпись и колбэки. Вид
 * шкалы собирается общей функцией (так же, как в конструкторе).
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
        ...buildProspectScaleView({
            items: color.items,
            current,
            previewCode,
            error: color.error,
            isLoading: color.isLoading,
        }),
        hasField: Boolean(color.field),
        select: code => dispatch(setCurrentColor(code as CompanyColorType)),
        setPreview,
    };
};
