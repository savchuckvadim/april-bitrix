'use client';

import type { ComponentType } from 'react';
import type { CompositionEditorState } from '../hooks/use-composition-editor';
import type { CompositionViewMode } from '../model/types';
import { CompositionConsaltingBlock } from './CompositionConsaltingBlock';
import { CompositionLtOtherBlock } from './CompositionLtOtherBlock';
import { CompositionMessages } from './CompositionMessages';
import { CompositionStarBlock } from './CompositionStarBlock';
import { CompositionCardsView } from './views/CompositionCardsView';
import { CompositionClassicView } from './views/CompositionClassicView';
import { CompositionDenseView } from './views/CompositionDenseView';
import { CompositionFlatView } from './views/CompositionFlatView';
import { CompositionSummaryView } from './views/CompositionSummaryView';
import type { CompositionViewProps } from './views/types';

export interface CompositionEditorBodyProps {
    editor: CompositionEditorState;
    /**
     * Блок доп. пакетов LT. На «Ценах» у пакетов свои окна (+ Пакет LT,
     * строка пакета) — в наполнении Гаранта только его LT-чекбоксы.
     */
    showExtraLt?: boolean;
}

const VIEWS: Record<CompositionViewMode, ComponentType<CompositionViewProps>> = {
    classic: CompositionClassicView,
    cards: CompositionCardsView,
    flat: CompositionFlatView,
    dense: CompositionDenseView,
    summary: CompositionSummaryView,
};

/**
 * Категории наполнения в выбранном пользователем виде, пакеты LT-other,
 * консалтинг и СТАР отдельными блоками. Академия привязана к количеству
 * товара, поэтому выбирается на шаге цен (features/academy-picker). Сообщения правил прижаты к низу области
 * прокрутки: остаются на виду при длинном списке и, появляясь, не двигают
 * чекбоксы. Одно тело для панели шага «Комплект» и окна товара на «Ценах».
 */
export const CompositionEditorBody = ({ editor, showExtraLt = true }: CompositionEditorBodyProps) => {
    const { composition } = editor;
    if (!composition) return null;
    const View = VIEWS[editor.view.mode];

    return (
        <div className="flex flex-col gap-3">
            <View editor={editor} />
            {showExtraLt ? (
                <CompositionLtOtherBlock
                    composition={composition}
                    catalog={editor.catalog}
                    packets={editor.ltPackets}
                    onApply={editor.applyComposition}
                />
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
                <CompositionConsaltingBlock
                    composition={composition}
                    catalog={editor.catalog}
                    onApply={editor.applyComposition}
                />
                <CompositionStarBlock
                    composition={composition}
                    catalog={editor.catalog}
                    locked={editor.starLocked}
                    onApply={editor.applyComposition}
                />
            </div>
            <CompositionMessages {...editor.messages} />
        </div>
    );
};
