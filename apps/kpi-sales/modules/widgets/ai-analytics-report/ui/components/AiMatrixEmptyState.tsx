'use client';

import { Button } from '@workspace/ui/components/button';
import type { AiMatrixCoverageReason } from '@/modules/entities/ai-analytics';
import { aiMatrixEmptyView } from '../../lib/ai-matrix-empty.util';
import { useAiMatrixFilterActions } from '../../hooks/use-ai-matrix-filter-actions';
import { useAiManagerName } from '../../hooks/use-ai-manager-name';

interface AiMatrixEmptyStateProps {
    reason: AiMatrixCoverageReason;
}

/**
 * Пустое состояние матриц с причиной и действием: «Показать с даты»
 * (ставит начало периода глобального фильтра), «Добавить в фильтр»
 * (пилотных сотрудников) либо текст «попросите разработчика».
 */
export const AiMatrixEmptyState = ({ reason }: AiMatrixEmptyStateProps) => {
    const managerName = useAiManagerName();
    const { showFrom, addToFilter } = useAiMatrixFilterActions();
    const view = aiMatrixEmptyView(reason, managerName);

    const onAction = () => {
        if (!view.action) return;
        if (view.action.kind === 'show-from') showFrom(view.action.date);
        else addToFilter(view.action.managerIds);
    };

    return (
        <div className="space-y-2 py-2 text-xs text-muted-foreground">
            <p>{view.text}</p>
            {view.note && <p>{view.note}</p>}
            {view.action && (
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={onAction}
                >
                    {view.action.label}
                </Button>
            )}
        </div>
    );
};
