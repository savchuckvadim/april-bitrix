'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import type { TreeCheckState } from '../../lib/build-tree.util';

interface TriCheckboxProps {
    state: TreeCheckState;
    onToggle: () => void;
    ariaLabel?: string;
}

/** Tri-state чекбокс: all → checked, partial → indeterminate, none → пусто. */
export const TriCheckbox = ({ state, onToggle, ariaLabel }: TriCheckboxProps) => (
    <Checkbox
        checked={state === 'all' ? true : state === 'partial' ? 'indeterminate' : false}
        onCheckedChange={onToggle}
        aria-label={ariaLabel}
    />
);
