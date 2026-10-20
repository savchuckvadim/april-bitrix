'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Table, TableBody } from '@workspace/ui/components/table';
import { SectionCard } from '@workspace/april-ui';
import { useAppSelector } from '@/modules/app';
import {
    AI_SCOPE_TEXT,
    aiScopeEmptyText,
    selectAiPilotIds,
    selectAiScopeNote,
    type AiOverview,
} from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { useAiOverviewGroups } from '../hooks/use-ai-overview-groups';
import { useAiTypesDrawer } from '../hooks/use-ai-types-drawer';
import { useAiManagerName } from '../hooks/use-ai-manager-name';
import { useAiSignalRowContext } from '../hooks/use-ai-signal-row-context';
import { AiQueuedState } from './components/AiQueuedState';
import { AiOverviewMeta } from './components/AiOverviewMeta';
import { AiSignalSection } from './components/AiSignalSection';
import { AiSignalTableHead } from './components/AiSignalTableHead';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiStyleDialog } from './AiStyleDialog';
import { AiDossierDialog } from './AiDossierDialog';
import { AI_SIGNAL_TABLE_TEXT } from '../lib/ai-signal-columns.texts';
import { aiFinanceSourceOf, aiSignalColumns } from '../lib/ai-signal.util';

interface AiSignalBodyProps {
    overview: AiOverview;
    onOpenStyle: (managerId: string) => void;
    onOpenDossier: (managerId: string) => void;
}

/**
 * Тело таблицы: шапка с подсказками у каждой колонки и периодом финансов,
 * секции по структуре, подпись про периметр разбора; пустое состояние —
 * честная причина (в фильтре никого из разбора либо звонков нет).
 */
const AiSignalBody = ({
    overview,
    onOpenStyle,
    onOpenDossier,
}: AiSignalBodyProps) => {
    const managers = overview.managers;
    const sections = useAiOverviewGroups(managers);
    const columns = aiSignalColumns(managers);
    const context = useAiSignalRowContext(overview);
    const scope = useAppSelector(selectAiScopeNote);
    const pilotIds = useAppSelector(selectAiPilotIds);
    const managerName = useAiManagerName();

    if (!sections.length) {
        return (
            <p className="py-2 text-xs text-muted-foreground">
                {scope?.empty
                    ? aiScopeEmptyText(pilotIds.map(managerName))
                    : AI_SIGNAL_TABLE_TEXT.emptyNoManagers}
            </p>
        );
    }

    return (
        <>
            <Card className="my-2 overflow-x-auto p-2 bg-popover text-primary">
                <Table className="bg-popover text-primary">
                    <AiSignalTableHead
                        columns={columns}
                        financeSource={aiFinanceSourceOf(managers)}
                    />
                    <TableBody>
                        {sections.map(section => (
                            <AiSignalSection
                                key={section.id}
                                section={section}
                                columns={columns}
                                context={context}
                                onOpenStyle={onOpenStyle}
                                onOpenDossier={onOpenDossier}
                            />
                        ))}
                    </TableBody>
                </Table>
            </Card>
            {scope?.pilotActive && (
                <p className="text-xs text-muted-foreground">
                    {AI_SCOPE_TEXT.totalsCaption}
                </p>
            )}
        </>
    );
};

/**
 * Таблица сигналов по менеджерам (обзор менеджер × тип за период):
 * группировка по отделам/группам структуры, при n < 8 — бэйдж «мало
 * данных». Кнопка открывает второй уровень — разбор по типам звонков;
 * «Стиль» в строке — карточку стиля менеджера (последний профиль),
 * «Досье» — досье менеджера за окно месяцев (Фаза 3). Колонки «Тренды»,
 * «Год назад» и «План руководителя» показываются, когда данные есть хотя
 * бы у одной строки. Строки — только сотрудники из разбора (режет бэк).
 */
export const AiSignalTable = () => {
    const overview = useAiSection('overview');
    const { openWithType } = useAiTypesDrawer();
    const [styleManagerId, setStyleManagerId] = useState<string | null>(null);
    const [dossierManagerId, setDossierManagerId] = useState<string | null>(
        null,
    );

    return (
        <SectionCard
            title={AI_SIGNAL_TABLE_TEXT.title}
            description={AI_SIGNAL_TABLE_TEXT.description}
            actions={
                <>
                    <AiTheoryLink topic="signalsTable" variant="icon" />
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-xs"
                        disabled={overview.status !== 'ready'}
                        onClick={() => openWithType()}
                    >
                        <Layers className="h-3 w-3" />
                        Разбор по типам
                    </Button>
                </>
            }
        >
            <AiQueuedState
                status={overview.status}
                jobStatus={overview.jobStatus}
                error={overview.error}
                loadingText="Считаем обзор…"
                skeletonRows={5}
                onRetry={overview.retry}
            />
            {overview.status === 'ready' && overview.data && (
                <div className="space-y-2">
                    <AiOverviewMeta overview={overview.data} />
                    <AiSignalBody
                        overview={overview.data}
                        onOpenStyle={setStyleManagerId}
                        onOpenDossier={setDossierManagerId}
                    />
                </div>
            )}
            <AiStyleDialog
                managerId={styleManagerId ?? ''}
                open={styleManagerId !== null}
                onOpenChange={open => {
                    if (!open) setStyleManagerId(null);
                }}
            />
            <AiDossierDialog
                managerId={dossierManagerId ?? ''}
                open={dossierManagerId !== null}
                onOpenChange={open => {
                    if (!open) setDossierManagerId(null);
                }}
            />
        </SectionCard>
    );
};
