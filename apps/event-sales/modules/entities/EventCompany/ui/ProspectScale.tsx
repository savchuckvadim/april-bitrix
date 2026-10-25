'use client';

import { FC } from 'react';
import { ProspectScaleBar } from '@workspace/april-ui/entity';
import { useProspectScale } from '../lib/hooks/use-prospect-scale';

/**
 * Прогноз по компании — шкала из трёх ступеней. Вёрстка общая с
 * конструктором (ProspectScaleBar), здесь — данные и запись «Звонков».
 */
interface ProspectScaleProps {
    compact?: boolean;
    /** `flat` — ступени одним цветом; `liquid` — прежняя градиентная полоса. */
    variant?: 'flat' | 'liquid';
    /** Полная ширина + подпись отдельной строкой (карточки и окна). */
    block?: boolean;
}

export const ProspectScale: FC<ProspectScaleProps> = ({
    compact,
    variant = 'flat',
    block,
}) => {
    const { hasField, ...scale } = useProspectScale();

    if (!hasField) return null;

    return (
        <ProspectScaleBar
            {...scale}
            compact={compact}
            variant={variant}
            block={block}
        />
    );
};
