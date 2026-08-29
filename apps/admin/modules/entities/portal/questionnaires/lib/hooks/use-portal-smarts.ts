'use client';

import { useMemo } from 'react';
import { usePortalDbSmarts } from '@/modules/entities/pbx/smart/db';
import type { QuestionnairePortalSmart } from '../../model';

/**
 * Смарты портала для раздела анкет.
 *
 * `GET /questionnaire-fields/sources` отдаёт смарты как НОСИТЕЛИ полей —
 * с идентификатором и названием, но без пары `type`/`group`, а именно она
 * говорит, какой поток события ведёт элементы смарта. Поэтому строки
 * `smarts` берутся у слайса смартов портала: там это тот же список, что
 * показывает карточка портала, и второго источника правды не появляется.
 *
 * Наружу отдаётся ровно то, что нужно анкетам: остальные поля строки
 * (воронки, стадии, идентификаторы Битрикса) разделу не нужны и в его
 * доменные типы не попадают.
 */
export const usePortalSmarts = (portalId: number) => {
    const query = usePortalDbSmarts(portalId);

    const smarts = useMemo<QuestionnairePortalSmart[] | undefined>(
        () =>
            query.data?.map(row => ({
                id: row.id,
                type: row.type,
                group: row.group,
                title: row.title,
            })),
        [query.data],
    );

    return {
        /** `undefined` — список ещё не прочитан: это не «смартов нет». */
        smarts,
        isLoading: query.isLoading,
        isError: query.isError,
    };
};
