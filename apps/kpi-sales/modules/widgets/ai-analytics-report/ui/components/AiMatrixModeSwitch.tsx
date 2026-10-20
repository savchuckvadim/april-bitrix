'use client';

import { HintTooltip, MicroSegmented } from '@workspace/april-ui';
import type { AiTypesMatrixMode } from '@/modules/entities/ai-analytics';
import { AI_MATRIX_BLOCK_TEXT } from '../../lib/ai-matrix-texts';

interface AiMatrixModeSwitchProps {
    value: AiTypesMatrixMode;
    onChange: (value: string) => void;
}

const T = AI_MATRIX_BLOCK_TEXT.types.mode;

/** Переключатель колонок «Корзины / По типам» с подсказкой, чем они отличаются. */
export const AiMatrixModeSwitch = ({ value, onChange }: AiMatrixModeSwitchProps) => (
    <div className="flex items-center gap-2">
        <HintTooltip title={T.hint.title} lines={[...T.hint.lines]}>
            <span className="cursor-help text-xs text-muted-foreground">
                {T.label}:
            </span>
        </HintTooltip>
        <MicroSegmented
            ariaLabel={T.label}
            size="xs"
            value={value}
            onChange={onChange}
            options={[
                { value: 'buckets', label: T.buckets },
                { value: 'types', label: T.types },
            ]}
        />
    </div>
);
