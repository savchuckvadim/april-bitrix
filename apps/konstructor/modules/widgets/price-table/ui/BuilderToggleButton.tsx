'use client';

import { Plus } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';

export interface BuilderToggleButtonProps {
    label: string;
    /** Мастер этого раздела открыт */
    active: boolean;
    disabled?: boolean;
    hint?: string;
    onClick: () => void;
}

/** «+» раздела шага цен: открывает и закрывает мастер добавления под заголовком. */
export const BuilderToggleButton = ({ label, active, disabled, hint, onClick }: BuilderToggleButtonProps) => (
    <Button
        size="sm"
        variant={active ? 'secondary' : 'outline'}
        aria-expanded={active}
        disabled={disabled}
        title={hint}
        onClick={onClick}
    >
        <Plus aria-hidden />
        {label}
    </Button>
);
