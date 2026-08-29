'use client';

import { useMemo } from 'react';
import { shallowEqual } from 'react-redux';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
// Прямой путь, а не барель слайса каталога: барель тянет транспорт.
import { selectQuestionnaireDefs } from '@/modules/entities/Questionnaire/model/selectors';
import type { ChecklistDef } from '../../type/call-checklist.type';
import { selectChecklistRows } from '../checklist-selectors';
import {
    buildChecklistFieldViews,
    type ChecklistFieldView,
} from '../checklist-field-view';
import {
    groupChecklistFields,
    type ChecklistFieldGroupView,
} from '../checklist-field-groups';
import {
    changeChecklistField,
    clearChecklistField,
} from '../../model/CallChecklistThunk';

export interface ModalChecklistView {
    def: ChecklistDef | null;
    fields: ChecklistFieldView[];
    /** Те же вопросы секциями `groupTitle` — в этом виде их рисует модалка. */
    groups: ChecklistFieldGroupView[];
    /** Все обязательные поля закрыты — «Готово» активна. */
    isReady: boolean;
    /** Базовая сделка ещё грузится — «сейчас: …» появится следом. */
    isBaseDealLoading: boolean;
    error: string | null;
}

/**
 * Активная модальная анкета (шаг цепочки send): те же поля и те же правила
 * заполнения, что в инлайн-карточке — сборка вьюхи общая
 * (`buildChecklistFieldViews`), носители полей общие (`selectChecklistRows`).
 */
export const useModalChecklist = (): ModalChecklistView => {
    const dispatch = useAppDispatch();
    const activeId = useAppSelector(s => s.callChecklist.activeModalId);
    // Состав анкет — из стора: ссылка на массив стабильна между действиями,
    // поэтому подписка не дёргает рендер.
    const defs = useAppSelector(selectQuestionnaireDefs);
    const saved = useAppSelector(s => s.callChecklist.valueByKey);
    const drafts = useAppSelector(s => s.callChecklist.draftByKey);
    const savingKeys = useAppSelector(s => s.callChecklist.savingKeys);
    const baseline = useAppSelector(s => s.callChecklist.baselineByKey);
    const error = useAppSelector(s => s.callChecklist.error);
    const isBaseDealLoading = useAppSelector(
        s => s.callChecklist.baseDeal.status === 'loading',
    );
    const rows = useAppSelector(selectChecklistRows, shallowEqual);
    const portal = useAppSelector(s => s.portal.portal);

    return useMemo(() => {
        const def = activeId
            ? (defs.find(item => item.code === activeId) ?? null)
            : null;
        if (!def) {
            return {
                def: null,
                fields: [],
                groups: [],
                isReady: false,
                isBaseDealLoading,
                error,
            };
        }

        const fields = buildChecklistFieldViews(def, {
            portal,
            rows,
            saved,
            drafts,
            savingKeys,
            baseline,
            onChange: (ref, value) =>
                dispatch(changeChecklistField(ref, value)),
            onClear: ref => dispatch(clearChecklistField(ref)),
        });

        return {
            def,
            fields,
            groups: groupChecklistFields(fields),
            isReady: fields.every(field => !field.isMissing),
            isBaseDealLoading,
            error,
        };
    }, [
        dispatch,
        activeId,
        defs,
        rows,
        portal,
        saved,
        drafts,
        savingKeys,
        baseline,
        isBaseDealLoading,
        error,
    ]);
};
