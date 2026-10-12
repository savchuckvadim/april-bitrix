'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { ConfirmDialog } from '@/modules/shared/ui';
import { SUPPLY_REPORT_TEMPLATE_PATH } from '../../consts/supply-report-template.consts';
import {
    useArchiveSupplyReportTemplate,
    useDownloadSupplyReportTemplate,
    useRemoveSupplyReportTemplate,
    useSetActiveSupplyReportTemplate,
    useSetDefaultSupplyReportTemplate,
    useSupplyReportTemplates,
} from '../../lib/hooks';
import {
    downloadBlobFile,
    supplyReportTemplateFileName,
} from '../../lib/utils';
import type { ISupplyReportTemplateSummary } from '../../model';
import { SupplyReportTemplateTable } from '../supply-report-template-table/SupplyReportTemplateTable';

interface SupplyReportTemplateListProps {
    /** Задан в портальном дереве; `undefined` — глобальное дерево. */
    portalId?: string;
    /** Префикс маршрутов раздела. Передаётся страницей. */
    basePath?: string;
}

export function SupplyReportTemplateList({
    portalId,
    basePath,
}: SupplyReportTemplateListProps) {
    const router = useRouter();
    const navigationPath =
        basePath ??
        (portalId
            ? `/portal/${portalId}${SUPPLY_REPORT_TEMPLATE_PATH}`
            : SUPPLY_REPORT_TEMPLATE_PATH);

    const [search, setSearch] = React.useState('');
    const [showArchived, setShowArchived] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] =
        React.useState<ISupplyReportTemplateSummary | null>(null);

    const query = React.useMemo(
        () => ({
            search: search.trim() || undefined,
            // Архивные скрыты по умолчанию; флаг включает ровно архивные.
            is_archived: showArchived ? true : undefined,
        }),
        [search, showArchived],
    );

    const templatesQuery = useSupplyReportTemplates(query, portalId);
    const removeTemplate = useRemoveSupplyReportTemplate();
    const setActive = useSetActiveSupplyReportTemplate();
    const setDefault = useSetDefaultSupplyReportTemplate();
    const archiveTemplate = useArchiveSupplyReportTemplate();
    const downloadTemplate = useDownloadSupplyReportTemplate();

    const page = templatesQuery.data;
    const templates = page?.items ?? [];

    const handleDownload = async (item: ISupplyReportTemplateSummary) => {
        const blob = await downloadTemplate.mutateAsync({ id: item.id });
        downloadBlobFile(blob, supplyReportTemplateFileName(item));
    };

    const handleDeleteConfirm = async () => {
        if (!templateToDelete) {
            return;
        }
        await removeTemplate.mutateAsync(templateToDelete.id);
        setTemplateToDelete(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">
                    Шаблоны отчётов о поставке
                </h1>
                <div className="flex flex-wrap gap-2">
                    <Button onClick={() => router.push(`${navigationPath}/new`)}>
                        Создать шаблон
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => void templatesQuery.refetch()}
                    >
                        Обновить список
                    </Button>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Input
                    className="max-w-xs"
                    placeholder="Поиск по названию, коду и описанию"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
                <Button
                    variant={showArchived ? 'default' : 'outline'}
                    onClick={() => setShowArchived((prev) => !prev)}
                >
                    {showArchived ? 'Показаны архивные' : 'Показать архивные'}
                </Button>
                {page && (
                    <span className="text-sm text-muted-foreground">
                        Всего: {page.total}
                    </span>
                )}
            </div>

            {templatesQuery.isError && (
                <p className="text-sm text-destructive">
                    Не удалось загрузить список шаблонов.
                </p>
            )}

            <SupplyReportTemplateTable
                data={templates}
                isLoading={templatesQuery.isLoading}
                onRowClick={(item) =>
                    router.push(`${navigationPath}/${item.id}`)
                }
                onEdit={(item) =>
                    router.push(`${navigationPath}/${item.id}/edit`)
                }
                onDelete={(item) => setTemplateToDelete(item)}
                onSetActive={(item) =>
                    setActive.mutate({ id: item.id, isActive: !item.is_active })
                }
                onSetDefault={(item) => setDefault.mutate(item.id)}
                onArchive={(item) =>
                    archiveTemplate.mutate({
                        id: item.id,
                        archived: !item.is_archived,
                    })
                }
                onDownload={(item) => void handleDownload(item)}
            />

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setTemplateToDelete(null);
                    }
                }}
                title="Подтвердите удаление"
                description={`Удалить шаблон «${templateToDelete?.name ?? ''}»? Файл шаблона будет удалён вместе с записью.`}
                onConfirm={handleDeleteConfirm}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
