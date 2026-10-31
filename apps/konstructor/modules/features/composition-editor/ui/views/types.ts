import type { CompositionEditorState } from '../../hooks/use-composition-editor';

/** Пропсы вида наполнения: все виды работают с одним состоянием редактора */
export interface CompositionViewProps {
    editor: CompositionEditorState;
}
