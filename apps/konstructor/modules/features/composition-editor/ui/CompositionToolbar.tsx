'use client';

import { ChevronsDownUp, ChevronsUpDown, ListFilter, Scale } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import { MicroSegmented } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import type { CompositionEditorState } from '../hooks/use-composition-editor';
import { COMPOSITION_VIEW_OPTIONS } from '../model/types';

export interface CompositionToolbarProps {
    editor: CompositionEditorState;
}

/** Вес против эталона, режим правил, вид наполнения и его собственные настройки. */
export const CompositionToolbar = ({ editor }: CompositionToolbarProps) => {
    const { composition, weightCheck, sections, view } = editor;
    if (!composition) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {weightCheck ? (
                <ToneBadge
                    tone={weightCheck.matches ? 'success' : 'destructive'}
                    variant="soft"
                    title="Вес наполнения против эталона комплекта"
                >
                    Вес {weightCheck.weight} / {weightCheck.expected}
                </ToneBadge>
            ) : null}
            <Button variant="outline" size="sm" onClick={editor.toggleMode}>
                {composition.mode === 'rules' ? 'По правилам' : 'Без правил'}
            </Button>
            {view.mode === 'dense' ? (
                <IconAction
                    icon={ListFilter}
                    label={sections.onlyChecked ? 'Показать все блоки' : 'Только выбранные'}
                    pressed={sections.onlyChecked}
                    onClick={sections.toggleOnlyChecked}
                    size="md"
                />
            ) : null}
            {view.mode === 'cards' || view.mode === 'classic' ? (
                <IconAction
                    icon={sections.isAllOpen ? ChevronsDownUp : ChevronsUpDown}
                    label={
                        sections.isAllOpen
                            ? view.mode === 'classic'
                                ? 'Скрыть неотмеченные во всех категориях'
                                : 'Свернуть все категории'
                            : view.mode === 'classic'
                              ? 'Показать все блоки'
                              : 'Развернуть все категории'
                    }
                    onClick={sections.toggleAll}
                    size="md"
                />
            ) : null}
            <IconAction
                icon={Scale}
                label={view.showWeights ? 'Скрыть вес блоков' : 'Показать вес блоков'}
                hint="Общий вес комплекта виден всегда"
                pressed={view.showWeights}
                onClick={view.toggleWeights}
                size="md"
            />
            {/* последним: кнопки своего вида меняются, переключатель стоит на месте */}
            <MicroSegmented
                ariaLabel="Вид наполнения"
                options={[...COMPOSITION_VIEW_OPTIONS]}
                value={view.mode}
                onChange={view.setMode}
            />
        </div>
    );
};
