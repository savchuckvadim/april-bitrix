'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { SectionCard } from '@workspace/april-ui';
import { AI_BUCKET_LABELS, AI_BUCKETS } from '@/modules/entities/ai-analytics';
import { useAiSection } from '../hooks/use-ai-section';
import { useAiOverviewGroups } from '../hooks/use-ai-overview-groups';
import { useAiTypesDrawer } from '../hooks/use-ai-types-drawer';
import { AiQueuedState } from './components/AiQueuedState';
import { AiOverviewMeta } from './components/AiOverviewMeta';
import { AiSignalSection } from './components/AiSignalSection';
import { AiStyleDialog } from './AiStyleDialog';
import { AiDossierDialog } from './AiDossierDialog';

/** Колонки: сотрудник, сигнал, цифра, 3 корзины, тренды, год назад, продажи, аванс, чек, 2 плана, рычаги, «Не согласен». */
const COLUMNS = 12 + AI_BUCKETS.length;

/**
 * Таблица сигналов по менеджерам (обзор менеджер × тип за период):
 * группировка по отделам/группам структуры, при n < 8 — бэйдж «мало
 * данных». Кнопка открывает второй уровень — разбор по типам звонков;
 * «Стиль» в строке — карточку стиля менеджера (последний профиль),
 * «Досье» — досье менеджера за окно месяцев (Фаза 3). Колонки «Тренды» и
 * «Год назад» — из снапшотов трендов и пары «тот же месяц год назад».
 */
export const AiSignalTable = () => {
    const overview = useAiSection('overview');
    const sections = useAiOverviewGroups(overview.data?.managers ?? []);
    const { openWithType } = useAiTypesDrawer();
    const [styleManagerId, setStyleManagerId] = useState<string | null>(null);
    const [dossierManagerId, setDossierManagerId] = useState<string | null>(
        null,
    );

    return (
        <SectionCard
            title="Сигналы по менеджерам"
            description="Менеджер → сигнал, ключевая цифра, корзины звонков, финансы, план CRM и рычаги"
            actions={
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
                    {sections.length ? (
                        <Card className="my-2 overflow-x-auto p-2 bg-popover text-primary">
                            <Table className="bg-popover text-primary">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="min-w-52">
                                            Сотрудник
                                        </TableHead>
                                        <TableHead>Сигнал</TableHead>
                                        <TableHead className="min-w-40">
                                            Ключевая цифра
                                        </TableHead>
                                        {AI_BUCKETS.map(bucket => (
                                            <TableHead
                                                key={bucket}
                                                className="text-right"
                                            >
                                                {AI_BUCKET_LABELS[bucket]}
                                            </TableHead>
                                        ))}
                                        <TableHead>Тренды</TableHead>
                                        <TableHead>Год назад</TableHead>
                                        <TableHead className="text-right">
                                            Продажи
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Аванс
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Мес. чек
                                        </TableHead>
                                        <TableHead>Звонки CRM</TableHead>
                                        <TableHead>Презентации CRM</TableHead>
                                        <TableHead className="min-w-44">
                                            Рычаги
                                        </TableHead>
                                        <TableHead />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sections.map(section => (
                                        <AiSignalSection
                                            key={section.id}
                                            section={section}
                                            columns={COLUMNS}
                                            onOpenStyle={setStyleManagerId}
                                            onOpenDossier={setDossierManagerId}
                                        />
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    ) : (
                        <p className="py-2 text-xs text-muted-foreground">
                            В периметре за период нет менеджеров со звонками.
                        </p>
                    )}
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
