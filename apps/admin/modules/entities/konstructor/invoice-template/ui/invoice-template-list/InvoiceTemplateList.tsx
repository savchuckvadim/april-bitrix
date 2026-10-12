'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { ConfirmDialog } from '@/modules/shared/ui';
import { INVOICE_TEMPLATE_PATH } from '../../consts/invoice-template.consts';
import {
    useArchiveInvoiceTemplate,
    useDownloadInvoiceTemplate,
    useInvoiceTemplates,
    useRemoveInvoiceTemplate,
    useSetActiveInvoiceTemplate,
    useSetDefaultInvoiceTemplate,
    useUnarchiveInvoiceTemplate,
} from '../../lib/hooks';
import {
    buildInvoiceTemplateListParams,
    downloadInvoiceTemplateFile,
} from '../../lib/utils';
import type { IInvoiceTemplate } from '../../model';
import {
    EMPTY_INVOICE_TEMPLATE_FILTERS,
    InvoiceTemplateFilters,
    type InvoiceTemplateFiltersState,
} from '../invoice-template-filters/InvoiceTemplateFilters';
import { InvoiceTemplateTable } from '../invoice-template-table/InvoiceTemplateTable';

interface InvoiceTemplateListProps {
    /** Задан — портальное дерево: список и создание ограничены этим порталом. */
    portalId?: string;
    basePath?: string;
}

export function InvoiceTemplateList({
    portalId,
    basePath,
}: InvoiceTemplateListProps) {
    const router = useRouter();
    const navigationPath =
        basePath ??
        (portalId
            ? `/portal/${portalId}${INVOICE_TEMPLATE_PATH}`
            : INVOICE_TEMPLATE_PATH);

    const [filters, setFilters] = React.useState<InvoiceTemplateFiltersState>({
        ...EMPTY_INVOICE_TEMPLATE_FILTERS,
        // Портальное дерево: портал — часть запроса, а не выбор пользователя.
        portal_id: portalId ?? '',
    });

    // Параметры собираются из состояния фильтров и уходят в query. Смена
    // фильтра меняет queryKey и перезапрашивает список — массив на клиенте
    // не фильтруется (архивные строки бэк иначе просто не отдаст).
    const params = React.useMemo(
        () => buildInvoiceTemplateListParams(filters),
        [filters],
    );

    const templatesQuery = useInvoiceTemplates(params);

    const removeTemplate = useRemoveInvoiceTemplate();
    const setActiveTemplate = useSetActiveInvoiceTemplate();
    const setDefaultTemplate = useSetDefaultInvoiceTemplate();
    const archiveTemplate = useArchiveInvoiceTemplate();
    const unarchiveTemplate = useUnarchiveInvoiceTemplate();
    const downloadTemplate = useDownloadInvoiceTemplate();

    const [templateToDelete, setTemplateToDelete] =
        React.useState<IInvoiceTemplate | null>(null);

    const templates = Array.isArray(templatesQuery.data)
        ? templatesQuery.data
        : [];

    const handleDownload = async (item: IInvoiceTemplate) => {
        const file = await downloadTemplate.mutateAsync(item.id);
        downloadInvoiceTemplateFile(file, `${item.name || item.id}.docx`);
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
            <div className="flex items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">Шаблоны счетов</h1>
                <div className="flex gap-2">
                    <Button onClick={() => router.push(`${navigationPath}/new`)}>
                        Создать шаблон
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => templatesQuery.refetch()}
                        disabled={templatesQuery.isFetching}
                    >
                        Обновить список
                    </Button>
                </div>
            </div>

            <InvoiceTemplateFilters
                value={filters}
                onChange={setFilters}
                portalLocked={!!portalId}
            />

            <InvoiceTemplateTable
                data={templates}
                isLoading={templatesQuery.isLoading}
                onRowClick={(item) =>
                    router.push(`${navigationPath}/${item.id}`)
                }
                onEdit={(item) =>
                    router.push(`${navigationPath}/${item.id}/edit`)
                }
                onDelete={(item) => setTemplateToDelete(item)}
                // Флаг передаётся явно: эндпоинт принимает значение, а не
                // переключает его сам.
                onToggleActive={(item) =>
                    setActiveTemplate.mutate({
                        id: item.id,
                        isActive: !item.is_active,
                    })
                }
                onSetDefault={(item) =>
                    setDefaultTemplate.mutate({ id: item.id, isDefault: true })
                }
                onArchive={(item) => archiveTemplate.mutate(item.id)}
                onUnarchive={(item) => unarchiveTemplate.mutate(item.id)}
                onDownload={handleDownload}
            />

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => {
                    if (!open) {
                        setTemplateToDelete(null);
                    }
                }}
                title="Подтвердите удаление"
                description={`Удалить шаблон счёта «${templateToDelete?.name ?? ''}» вместе с файлом?`}
                onConfirm={handleDeleteConfirm}
                confirmLabel="Удалить"
                variant="destructive"
            />
        </div>
    );
}
