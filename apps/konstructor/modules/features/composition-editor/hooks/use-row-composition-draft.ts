'use client';

import type { KRow } from '@/modules/entities/row-set';
import { useCompositionDraft } from './use-composition-draft';
import { useCompositionEditor } from './use-composition-editor';

/**
 * Наполнение Гаранта окном: редактор работает с черновиком, в сборку состав
 * уходит по «Сохранить». Окно, открытое из строки платного LT, не закрывается
 * само, когда снятые сервисы убирают эту строку из таблицы.
 */
export const useRowCompositionDraft = (row: KRow, onDone: () => void) => {
    const draft = useCompositionDraft(row);
    const editor = useCompositionEditor(draft.row, draft.write);

    return {
        editor,
        changed: draft.changed,
        confirm: () => {
            draft.save();
            onDone();
        },
    };
};
