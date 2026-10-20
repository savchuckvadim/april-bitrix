'use client';

import { useState } from 'react';
import {
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import { AI_DOSSIER_MONTHS } from '@/modules/entities/ai-analytics';
import { useAiDossier } from '../hooks/use-ai-dossier';
import { useAiManagerName } from '../hooks/use-ai-manager-name';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiQueuedState } from './components/AiQueuedState';
import { AiDossierBody, AiDossierToolbar } from './components/AiDossierBody';

export interface AiDossierDialogProps {
    managerId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Тонкая обёртка досье менеджера в диалоге — запасной путь, когда ссылки
 * на страницу сотрудника нет (публичный снимок). Разделы — AiDossierBody,
 * те же, что в AI-разделе страницы сотрудника. Очередь + WS: пока
 * собирается — состояние задания; «Пересобрать» — заново, свежими данными.
 */
export const AiDossierDialog = ({
    managerId,
    open,
    onOpenChange,
}: AiDossierDialogProps) => {
    const [months, setMonths] = useState<number>(AI_DOSSIER_MONTHS.default);
    const dossier = useAiDossier(managerId, months, open);
    const managerName = useAiManagerName();
    const data = dossier.data;

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="lg"
            intensity="soft"
            cardClassName="max-h-[88vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle>Досье: {managerName(managerId)}</DialogTitle>
                    <AiHowWeCountButton endpoint="dossier" />
                    <AiTheoryLink topic="dossier" variant="icon" />
                </div>
                <DialogDescription>
                    Всё, что витрина знает о менеджере за окно: разделы
                    собираются из ночного пересчёта, пустой раздел приходит с
                    причиной.
                </DialogDescription>
            </DialogHeader>
            <AiDossierToolbar
                months={months}
                onMonths={setMonths}
                loading={dossier.status === 'loading'}
                onRebuild={dossier.rebuild}
                data={data}
            />
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
                <AiQueuedState
                    status={dossier.status}
                    jobStatus={dossier.jobStatus}
                    error={dossier.error}
                    loadingText="Собираем досье…"
                    skeletonRows={4}
                    onRetry={dossier.retry}
                />
                {data && <AiDossierBody dossier={data} managerName={managerName} />}
            </div>
        </GlassDialog>
    );
};
