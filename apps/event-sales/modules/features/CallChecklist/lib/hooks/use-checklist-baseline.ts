'use client';

import { useEffect } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ChecklistDef } from '../../type/call-checklist.type';
import { selectChecklistRows } from '../checklist-selectors';
import { captureChecklistBaseline } from '../../model/CallChecklistThunk';
import {
    isHiddenChecklistReportReady,
    reportHiddenChecklistQuestions,
} from '../../model/ChecklistHiddenThunk';

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
    // Готовность данных для отчёта о спрятанных вопросах — В ЗАВИСИМОСТЯХ, а
    // не только гардом внутри thunk'а. Слепок портала приезжает своим
    // листенером и строк сущностей не меняет: без этой зависимости эффект
    // после его приезда не перезапустился бы, и отчёт не ушёл бы вовсе.
    const reportReady = useAppSelector(isHiddenChecklistReportReady);

    useEffect(() => {
        dispatch(captureChecklistBaseline(defs));
        // Тот же момент — «вопросы появились на экране» — единственный, в
        // который честно видно, каких вопросов на экране НЕ появилось. Но
        // считать спрятанные можно только по ПРИЕХАВШИМ данным: до слепка
        // портала и до догрузки базовой сделки любой диагноз ложный (см.
        // ChecklistHiddenThunk). Дедупликация за сессию живёт в самом отчёте,
        // поэтому пересчёт по догрузившимся строкам счётчик не раздувает.
        if (!reportReady) return;
        dispatch(reportHiddenChecklistQuestions(defs));
    }, [dispatch, defs, rows, reportReady]);
};
