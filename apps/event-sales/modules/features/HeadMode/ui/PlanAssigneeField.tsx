'use client';

import { FC } from 'react';
import { FieldCombobox } from '@workspace/april-ui/fields';
import { usePlanAssignee } from '../lib/hooks/use-plan-assignee';
import { HEAD_MODE_TEXT } from '../lib/head-mode-texts';

/**
 * «Кому дело» — на кого записать следующее дело. Рисуется только
 * руководителю с включённым режимом; остальным дело записывается на них
 * самих, и выбирать нечего.
 */
export const PlanAssigneeField: FC = () => {
    const { isAvailable, options, value, isActing, assign } =
        usePlanAssignee();

    if (!isAvailable) return null;

    return (
        <FieldCombobox
            id="plan-assignee"
            label={HEAD_MODE_TEXT.assigneeLabel}
            options={options}
            value={value}
            placeholder={HEAD_MODE_TEXT.assigneePlaceholder}
            searchPlaceholder={HEAD_MODE_TEXT.assigneeSearch}
            emptyText={HEAD_MODE_TEXT.assigneeEmpty}
            hint={
                isActing
                    ? HEAD_MODE_TEXT.assigneeHintActing
                    : HEAD_MODE_TEXT.assigneeHintOwn
            }
            onChange={assign}
        />
    );
};
