'use client';

/**
 * Список шаблонов договора. ОДИН компонент обслуживает оба дерева:
 * глобальное (без `portalId`) и портальное (`portalId` + `basePath`).
 *
 * Пагинация РЕАЛЬНАЯ: `take`/`skip` уходят в запрос, `total` приходит из
 * ответа `{ items, total, take, skip }`. Никакого «загрузить всё и
 * нарезать на клиенте» — у шаблонов счёта список отдаёт голый массив без
 * total, и такую таблицу обслуживать нельзя.
 */
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { ConfirmDialog } from '@/modules/shared/ui';
import { Field } from '@workspace/ui/shared';
import {
    CONTRACT_LTYPE_OPTIONS,
    getContractLtypeLabel,
} from '@/modules/entities/konstructor/lib';
import { CONTRACT_TEMPLATE_PATH } from '../../consts/contract-template.consts';
import type { ContractLtypeCode } from '@/modules/entities/konstructor/lib';
import {
    CONTRACT_TEMPLATE_PAGE_SIZE,
    type IContractTemplate,
    type IContractTemplateQuery,
} from '../../model';
import {
    useArchiveContractTemplate,
    useContractTemplates,
    useDownloadContractTemplate,
    useRemoveContractTemplate,
    useSetActiveContractTemplate,
    useSetDefaultContractTemplate,
} from '../../lib/hooks';
import { downloadFromResponse } from '../../lib/utils';
import { ContractTemplateTable } from '../contract-template-table/ContractTemplateTable';

interface ContractTemplateListProps {
    /** Задан — портальное дерево: список сужается до портала и общих. */
    portalId?: string;
    basePath?: string;
}

export function ContractTemplateList({ portalId, basePath }: ContractTemplateListProps) {
    const router = useRouter();
    const navigationPath =
        basePath ??
        (portalId ? `/portal/${portalId}${CONTRACT_TEMPLATE_PATH}` : CONTRACT_TEMPLATE_PATH);

    const [skip, setSkip] = React.useState(0);
    const [search, setSearch] = React.useState('');
    const [contractType, setContractType] = React.useState<ContractLtypeCode | ''>('');
    const [showArchived, setShowArchived] = React.useState(false);
    const [templateToDelete, setTemplateToDelete] =
        React.useState<IContractTemplate | null>(null);

    const take = CONTRACT_TEMPLATE_PAGE_SIZE;

    // Фильтры входят в ключ кэша через объект params — смена любого из них
    // сбрасывает страницу на первую (иначе можно оказаться на skip за
    // пределами нового total и увидеть пустую таблицу).
    const resetPage = () => setSkip(0);

    const query: IContractTemplateQuery = React.useMemo(
        () => ({
            take,
            skip,
            ...(portalId ? { portal_id: portalId } : {}),
            ...(search.trim() ? { search: search.trim() } : {}),
            ...(contractType ? { contract_type: contractType } : {}),
            // Архивные скрыты по умолчанию — флаг посылаем только когда их просят.
            ...(showArchived ? { is_archived: true } : {}),
        }),
        [contractType, portalId, search, showArchived, skip, take],
    );

    const { data, isLoading, isFetching } = useContractTemplates(query);

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / take));
    const currentPage = Math.floor(skip / take) + 1;

    const removeTemplate = useRemoveContractTemplate();
    const setActive = useSetActiveContractTemplate();
    const setDefault = useSetDefaultContractTemplate();
    const toggleArchive = useArchiveContractTemplate();
    const downloadTemplate = useDownloadContractTemplate();

    const handleDownload = async (item: IContractTemplate) => {
        const file = await downloadTemplate.mutateAsync({ id: item.id });
        downloadFromResponse(file, `${item.name || item.id}.docx`);
    };

    const handleDeleteConfirm = async () => {
        if (!templateToDelete) return;
        await removeTemplate.mutateAsync(templateToDelete.id);
        setTemplateToDelete(null);
    };

    return (
        <div className="space-y-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-3xl font-bold">Шаблоны договоров</h1>
                <Button onClick={() => router.push(`${navigationPath}/new`)}>
                    Создать шаблон
                </Button>
            </div>

            <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
                <Field label="Поиск" className="min-w-[240px] flex-1">
                    <Input
                        value={search}
                        placeholder="Название или код"
                        onChange={event => {
                            setSearch(event.target.value);
                            resetPage();
                        }}
                    />
                </Field>

                <Field label="Тип договора" className="min-w-[220px]">
                    {/* Нативный select: нужен пустой пункт «любой», которого
                        у Radix-селекта быть не может (value="" запрещено). */}
                    <select
                        className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                        value={contractType}
                        onChange={event => {
                            setContractType(event.target.value as ContractLtypeCode | '');
                            resetPage();
                        }}
                    >
                        <option value="">Все типы</option>
                        {CONTRACT_LTYPE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Field>

                <Button
                    variant={showArchived ? 'default' : 'outline'}
                    onClick={() => {
                        setShowArchived(prev => !prev);
                        resetPage();
                    }}
                >
                    {showArchived ? 'Показаны архивные' : 'Показать архивные'}
                </Button>
            </div>

            {contractType && (
                <p className="text-sm text-muted-foreground">
                    Фильтр: {getContractLtypeLabel(contractType)}
                </p>
            )}

            <ContractTemplateTable
                data={items}
                isLoading={isLoading}
                onRowClick={item => router.push(`${navigationPath}/${item.id}`)}
                onEdit={item => router.push(`${navigationPath}/${item.id}/edit`)}
                onDelete={item => setTemplateToDelete(item)}
                onDownload={handleDownload}
                onSetActive={item =>
                    setActive.mutate({ id: item.id, isActive: !item.is_active })
                }
                onSetDefault={item =>
                    setDefault.mutate({ id: item.id, isDefault: !item.is_default })
                }
                onToggleArchive={item =>
                    toggleArchive.mutate({ id: item.id, archived: !item.is_archived })
                }
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">
                    Всего: {total}
                    {isFetching && ' · обновление...'}
                </span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={skip === 0}
                        onClick={() => setSkip(Math.max(0, skip - take))}
                    >
                        Назад
                    </Button>
                    <span className="text-sm">
                        Стр. {currentPage} из {pageCount}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={skip + take >= total}
                        onClick={() => setSkip(skip + take)}
                    >
                        Вперёд
                    </Button>
                </div>
            </div>

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={open => {
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
