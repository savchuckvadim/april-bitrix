'use client';

import type { ComponentType } from 'react';
import type { CompositionEditorState } from '../hooks/use-composition-editor';
import type { CompositionViewMode } from '../model/types';
import { CompositionLtOtherBlock } from './CompositionLtOtherBlock';
import { CompositionMessages } from './CompositionMessages';
import { CompositionServicesBlock } from './CompositionServicesBlock';
import { CompositionCardsView } from './views/CompositionCardsView';
import { CompositionDenseView } from './views/CompositionDenseView';
import { CompositionFlatView } from './views/CompositionFlatView';
import { CompositionSummaryView } from './views/CompositionSummaryView';
import type { CompositionViewProps } from './views/types';

export interface CompositionEditorBodyProps {
    editor: CompositionEditorState;
}

const VIEWS: Record<CompositionViewMode, ComponentType<CompositionViewProps>> = {
    cards: CompositionCardsView,
    flat: CompositionFlatView,
    dense: CompositionDenseView,
    summary: CompositionSummaryView,
};

/**
 * Категории наполнения в выбранном пользователем виде, пакеты LT-other и
 * сервисы строки. Сообщения правил прижаты к низу области прокрутки: остаются
 * на виду при длинном списке и, появляясь, не двигают чекбоксы. Одно тело для
 * панели шага «Комплект» и окна товара на «Ценах».
 */
export const CompositionEditorBody = ({ editor }: CompositionEditorBodyProps) => {
    const { composition } = editor;
    if (!composition) return null;
    const View = VIEWS[editor.view.mode];

    return (
        <div className="flex flex-col gap-3">
            <View editor={editor} />
            {editor.canHaveExtraLt ? (
                <CompositionLtOtherBlock
                    composition={composition}
                    catalog={editor.catalog}
                    packets={editor.ltPackets}
                    onApply={editor.applyComposition}
                />
            ) : null}
            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
                <CompositionServicesBlock
                    composition={composition}
                    catalog={editor.catalog}
                    onApply={editor.applyComposition}
                />
            </div>
            <CompositionMessages {...editor.messages} />
        </div>
    );
};
