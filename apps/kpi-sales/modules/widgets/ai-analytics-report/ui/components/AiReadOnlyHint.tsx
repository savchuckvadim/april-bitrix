'use client';

import type { ReactNode } from 'react';
import { HintTooltip } from '@workspace/april-ui';

interface AiReadOnlyHintProps {
    /** Почему кнопки неактивны; null — без подсказки, children как есть. */
    hint: string | null;
    children: ReactNode;
}

/**
 * Подсказка к неактивным кнопкам записи (режим «Смотреть как…»): у
 * disabled-кнопки нет событий мыши, поэтому тултип висит на обёртке.
 */
export const AiReadOnlyHint = ({ hint, children }: AiReadOnlyHintProps) =>
    hint ? (
        <HintTooltip title={hint}>
            <span className="inline-flex items-center gap-1" tabIndex={0}>
                {children}
            </span>
        </HintTooltip>
    ) : (
        <>{children}</>
    );
