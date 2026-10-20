'use client';

import { HintTooltip } from '@workspace/april-ui';
import type { AiMatrixLegendView } from '../../lib/ai-matrix-legend.util';
import { AiTheoryLink } from './AiTheoryLink';

interface AiMatrixLegendProps {
    legend: AiMatrixLegendView;
}

const HINT_TRIGGER =
    'cursor-help border-b border-dashed border-muted-foreground/60';

/**
 * Легенда под заголовком блока-матрицы: одна строка «крупно — оценка ·
 * мелко — звонков · цвет — выше/ниже среднего · «ещё N» · какие звонки
 * считаются» с подсказкой, как читать таблицу, и ссылкой на теорию.
 */
export const AiMatrixLegend = ({ legend }: AiMatrixLegendProps) => (
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <HintTooltip title={legend.hint.title} lines={[...legend.hint.lines]}>
            <span className={HINT_TRIGGER}>{legend.text}</span>
        </HintTooltip>
        <AiTheoryLink topic="kpiTables" />
    </div>
);
