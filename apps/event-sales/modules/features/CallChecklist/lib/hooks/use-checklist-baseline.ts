'use client';

import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ChecklistDef } from '../../type/call-checklist.type';
import { selectChecklistRows } from '../checklist-selectors';
import { captureChecklistBaseline } from '../../model/CallChecklistThunk';

/**
 * Снимок значений CRM для пунктов с «обязательностью изменения» — в момент,
 * когда вопросы появились на экране.
 *
 * Отдельным хуком, а не эффектом в компоненте: карточка вопросов монтируется
 * дважды (колонка плана и окно предпроверки), и снимок обязан быть общим —
 * первый победивший ключ фиксируется в сторе (`baselineCaptured`), поэтому
 * повторные вызовы безвредны.
 *
 * Зависимость от строк сущностей нужна: во встройке-компании строка базовой
 * сделки догружается позже показа карточки, и без пересчёта снимок остался
 * бы пустым — тогда любой ответ, включая прежнее значение, закрывал бы
 * пункт.
 */
export const useChecklistBaselineCapture = (defs: ChecklistDef[]): void => {
    const dispatch = useAppDispatch();
    const rows = useAppSelector(selectChecklistRows, shallowEqual);

    useEffect(() => {
        dispatch(captureChecklistBaseline(defs));
    }, [dispatch, defs, rows]);
};
