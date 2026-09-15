'use client';

import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import { aiByTypeDescription } from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { useAiTypesDrawer } from '../hooks/use-ai-types-drawer';
import { AiTypesToolbar } from './components/AiTypesToolbar';
import { AiQueuedState } from './components/AiQueuedState';
import { AiScoreTable } from './components/AiScoreTable';
import { AiLongTable } from './components/AiLongTable';
import { AiObjectionsTable } from './components/AiObjectionsTable';

/**
 * Второй уровень «Разбор по типам»: подвкладки «Все» + типы из карты
 * алфавитов + «Возражения», раскладка широкий / длинный. Данные — срез
 * кэша обзора (by-type); запрос делает listener сущности при открытии и
 * смене выбора. При «Все» строки идут на пары менеджер × тип.
 */
export const AiTypesDrawer = () => {
    const { open, setOpen } = useAiTypesDrawer();
    const byType = useAiSection('byType');
    const data = byType.status === 'ready' ? byType.data : null;

    return (
        <GlassDialog
            open={open}
            onOpenChange={setOpen}
            size="full"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <DialogTitle>Разбор по типам звонков</DialogTitle>
                <DialogDescription>
                    {aiByTypeDescription(data)}
                </DialogDescription>
            </DialogHeader>
            <AiTypesToolbar />
            <div className="min-h-0 flex-1 overflow-y-auto">
                <AiQueuedState
                    status={byType.status}
                    jobStatus={byType.jobStatus}
                    error={byType.error}
                    loadingText="Собираем срез…"
                    skeletonRows={4}
                    onRetry={byType.retry}
                />
                {data?.callType === 'objections' && data.objections && (
                    <AiObjectionsTable objections={data.objections} />
                )}
                {data &&
                    data.callType !== 'objections' &&
                    data.layout === 'wide' && (
                        <AiScoreTable
                            rows={data.wide ?? []}
                            callType={data.callType}
                            totals={data.totals}
                            totalsByType={data.totalsByType}
                        />
                    )}
                {data &&
                    data.callType !== 'objections' &&
                    data.layout === 'long' && (
                        <AiLongTable
                            rows={data.long ?? []}
                            callType={data.callType}
                        />
                    )}
            </div>
        </GlassDialog>
    );
};
