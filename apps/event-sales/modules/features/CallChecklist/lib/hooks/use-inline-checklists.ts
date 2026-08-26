'use client';

import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import type { ChecklistDef } from '../../type/call-checklist.type';
import {
    selectChecklistRows,
    selectInlineChecklistsAt,
} from '../checklist-selectors';
import {
    buildChecklistFieldViews,
    type ChecklistFieldView,
} from '../checklist-field-view';
import {
    changeChecklistField,
    clearChecklistField,
} from '../../model/CallChecklistThunk';

export interface InlineChecklistView {
    def: ChecklistDef;
    fields: ChecklistFieldView[];
}

export interface InlineChecklistsView {
    checklists: InlineChecklistView[];
    error: string | null;
}

/**
 * Активные инлайн-блоки одной колонки: `plan` — что нужно знать ДО
 * следующего звонка, `report` — что выяснили В разговоре (вопросы по типу
 * отчётного события).
 *
 * Активность считают ТОЛЬКО селекторы (`checklist-selectors`) — те же, что
 * зовёт валидация отправки. Своя копия триггеров здесь когда-то расходилась
 * с ними (не знала фолбэка на базовую сделку), и получался дедлок: окно
 * предпроверки требовало заполнить чек-лист, которого карточка не показывала.
 *
 * `shallowEqual` на наборе определений: селектор собирает новый массив, но
 * элементы — те же объекты каталога, поэтому подписка не дёргает рендер на
 * каждое действие стора.
 */
export const useInlineChecklists = (
    place: 'plan' | 'report' = 'plan',
): InlineChecklistsView => {
    const dispatch = useAppDispatch();
    const error = useAppSelector(s => s.callChecklist.error);
    const saved = useAppSelector(s => s.callChecklist.valueByCode);
    const drafts = useAppSelector(s => s.callChecklist.draftByCode);
    const savingCodes = useAppSelector(s => s.callChecklist.savingCodes);
    const defs = useAppSelector(
        state => selectInlineChecklistsAt(state, place),
        shallowEqual,
    );
    const rows = useAppSelector(selectChecklistRows, shallowEqual);
    const portal = useAppSelector(s => s.portal.portal);

    return useMemo(() => {
        const checklists = defs
            .map(def => ({
                def,
                fields: buildChecklistFieldViews(def, {
                    portal,
                    rows,
                    saved,
                    drafts,
                    savingCodes,
                    onChange: (field, value) =>
                        dispatch(changeChecklistField(field, value)),
                    onClear: field => dispatch(clearChecklistField(field)),
                }),
            }))
            // Ни одно поле не установлено — чек-листа нет (самогейт).
            .filter(checklist => checklist.fields.length > 0);

        return { checklists, error };
    }, [dispatch, defs, rows, portal, saved, drafts, savingCodes, error, place]);
};
