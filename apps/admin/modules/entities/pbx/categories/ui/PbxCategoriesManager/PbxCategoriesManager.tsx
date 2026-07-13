'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import { ConfirmDialog } from '@/modules/shared/ui';
import { Accordion } from '@workspace/ui/components/accordion';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Checkbox } from '@workspace/ui/components/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import type { PbxCategoryCompareRow } from '../../../lib/model/common';
import type { PbxCategoriesAdapter } from '../../model';
import { usePbxCategories } from '../../lib/hooks';
import { PbxCategoryItem } from '../PbxCategoryItem';

/**
 * Reusable funnel (category) + stage screen driven by a `PbxCategoriesAdapter`.
 * Three-source compare (template ↔ Bitrix ↔ PortalDB) with nested stages,
 * install/sync, search, optional category delete and stage edit/delete. The
 * group + variant (categoryName/smartName/rpaName) selects scope every call.
 */
export function PbxCategoriesManager({
    portalId,
    adapter,
    lockedScope,
    allowAllPortals = false,
}: {
    portalId: number;
    adapter: PbxCategoriesAdapter;
    /**
     * Pin the manager to one group + variant and hide the selects (drill-down
     * from the process detail page). When omitted the selects render as usual.
     */
    lockedScope?: { group: string; variant: string };
    /**
     * Expose the "domain=all" dangerous mode (delete/edit across every portal).
     * Off by default: inside the portal context (`[portalId]/pbx/…`) every
     * operation must stay scoped to the current portal. Only the future
     * portal-agnostic screen should opt in.
     */
    allowAllPortals?: boolean;
}) {
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const [group, setGroup] = React.useState<string>(
        lockedScope?.group ?? adapter.groupOptions[0]?.value ?? '',
    );
    const [variant, setVariant] = React.useState<string>(
        lockedScope?.variant ?? adapter.variantOptions[0]?.value ?? '',
    );
    const [search, setSearch] = React.useState('');
    const [applyToAll, setApplyToAll] = React.useState(false);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [deleteRow, setDeleteRow] = React.useState<PbxCategoryCompareRow | null>(
        null,
    );

    const {
        rows,
        isLoading,
        searchActive,
        installTemplate,
        installCategories,
        deleteCategories,
        deleteStage,
        editStage,
    } = usePbxCategories(adapter, { domain, group, variant, search });

    const effectiveDomain = allowAllPortals && applyToAll ? 'all' : domain ?? '';

    const toggleSelect = (code: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });

    const selectedCount = rows.filter(
        (r) => selected.has(r.code) && r.inTemplate,
    ).length;

    const syncSelected = async () => {
        if (!domain) return;
        const categories = rows
            .filter((r) => selected.has(r.code) && r.template)
            .map((r) => r.template!);
        if (categories.length === 0) return;
        await installCategories.mutateAsync(categories);
        setSelected(new Set());
    };

    if (!portal.isLoading && !domain) {
        return (
            <p className="text-sm text-destructive">
                У портала не задан domain — установка недоступна.
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {!lockedScope && (
                <div>
                    <h1 className="text-2xl font-bold">{adapter.label}</h1>
                    <p className="text-sm text-muted-foreground">
                        Портал: {domain ?? '…'}
                    </p>
                </div>
            )}

            <div className="flex flex-wrap items-end gap-3 rounded-md border p-3">
                {!lockedScope && (
                    <>
                        <div className="space-y-1">
                            <Label>Группа</Label>
                            <Select value={group} onValueChange={setGroup}>
                                <SelectTrigger className="w-36">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {adapter.groupOptions.map((g) => (
                                        <SelectItem key={g.value} value={g.value}>
                                            {g.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>{adapter.variantLabel}</Label>
                            <Select value={variant} onValueChange={setVariant}>
                                <SelectTrigger className="w-48">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {adapter.variantOptions.map((c) => (
                                        <SelectItem key={c.value} value={c.value}>
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}
                <div className="flex-1 space-y-1 min-w-[200px]">
                    <Label>Поиск</Label>
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="code / name воронки или стадии…"
                    />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={() => installTemplate.mutate()}
                            disabled={installTemplate.isPending || !domain}
                        >
                            {installTemplate.isPending
                                ? 'Установка…'
                                : 'Установить весь шаблон'}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Устанавливает на портал все воронки шаблона со стадиями для
                        выбранной группы и варианта: создаёт отсутствующие в Bitrix и
                        обновляет существующие, затем зеркалит в PortalDB. Повторный
                        запуск не плодит дубликаты.
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="secondary"
                            onClick={syncSelected}
                            disabled={installCategories.isPending || selectedCount === 0}
                        >
                            {installCategories.isPending
                                ? 'Синхронизация…'
                                : `Синхронизировать выбранные (${selectedCount})`}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        Устанавливает/обновляет в Bitrix и PortalDB только отмеченные
                        воронки со стадиями. Подходит для точечной повторной
                        синхронизации.
                    </TooltipContent>
                </Tooltip>
            </div>

            {allowAllPortals && (
                <label className="flex items-center gap-2 text-sm text-destructive">
                    <Checkbox
                        checked={applyToAll}
                        onCheckedChange={(c) => setApplyToAll(Boolean(c))}
                    />
                    Опасный режим: применять удаление/правку ко ВСЕМ порталам
                    (domain=all)
                </label>
            )}

            {searchActive && (
                <p className="text-sm text-muted-foreground">
                    Фильтр по «{search.trim()}»: найдено {rows.length} —
                    показаны только совпадения (очистите поле, чтобы вернуть все).
                </p>
            )}

            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                </div>
            ) : rows.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                    Воронки не найдены
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-2">
                    {rows.map((row) => (
                        <PbxCategoryItem
                            key={row.code}
                            row={row}
                            selected={selected.has(row.code)}
                            canDeleteCategory={adapter.canDeleteCategories}
                            onToggleSelect={() => toggleSelect(row.code)}
                            onDeleteCategory={() => setDeleteRow(row)}
                            isStagePending={
                                editStage.isPending || deleteStage.isPending
                            }
                            onDeleteStage={(stage) =>
                                deleteStage.mutate({
                                    domain: effectiveDomain,
                                    categoryCode: row.code,
                                    stageCode: stage.code,
                                })
                            }
                            onEditStage={(stage, newValue) =>
                                editStage.mutateAsync({
                                    domain: effectiveDomain,
                                    categoryCode: row.code,
                                    stageCode: stage.code,
                                    newValue,
                                })
                            }
                        />
                    ))}
                </Accordion>
            )}

            <ConfirmDialog
                open={Boolean(deleteRow)}
                onOpenChange={(o) => !o && setDeleteRow(null)}
                title="Удалить воронку?"
                description={`Удалить воронку «${deleteRow?.name ?? ''}» (${
                    deleteRow?.code ?? ''
                }) со всеми стадиями из Bitrix и PortalDB?${
                    applyToAll ? ' Операция затронет ВСЕ порталы.' : ''
                }`}
                confirmLabel="Удалить"
                variant="destructive"
                onConfirm={async () => {
                    if (!deleteRow || !deleteCategories) return;
                    await deleteCategories.mutateAsync({
                        domain: effectiveDomain,
                        codes: [deleteRow.code],
                    });
                    setDeleteRow(null);
                }}
            />
        </div>
    );
}
