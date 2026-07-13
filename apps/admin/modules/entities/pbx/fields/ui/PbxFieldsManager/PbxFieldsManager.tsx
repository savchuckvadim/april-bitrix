'use client';

import * as React from 'react';
import { usePortal } from '@/modules/entities/portal/hooks';
import { ConfirmDialog } from '@/modules/shared/ui';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
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
import type { PbxFieldCompareRow } from '../../../lib/model/common';
import type { PbxFieldsAdapter } from '../../model';
import { usePbxFields, ALL_FIELD_TYPES } from '../../lib/hooks';
import { PbxFieldsCompareTable } from '../PbxFieldsCompareTable';
import { PbxFieldDetailDialog } from '../PbxFieldDetailDialog';
import { PbxFieldFormDialog } from '../PbxFieldFormDialog';

/**
 * Reusable "fields" screen driven by a `PbxFieldsAdapter`. Renders the
 * three-source compare table (template ↔ Bitrix ↔ PortalDB), install/sync,
 * search, enum-item management and field create/delete — gated by the adapter's
 * capability flags. The group + variant (appName/smartName/rpaName) selects come
 * from the adapter metadata and scope every operation.
 */
export function PbxFieldsManager({
    portalId,
    adapter,
    lockedScope,
    allowAllPortals = false,
}: {
    portalId: number;
    adapter: PbxFieldsAdapter;
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
    const caps = adapter.capabilities;

    const [group, setGroup] = React.useState<string>(
        lockedScope?.group ?? adapter.groupOptions[0]?.value ?? '',
    );
    const [variant, setVariant] = React.useState<string>(
        lockedScope?.variant ?? adapter.variantOptions[0]?.value ?? '',
    );
    const [search, setSearch] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState<string>(ALL_FIELD_TYPES);
    const [templateOnly, setTemplateOnly] = React.useState(true);
    const [applyToAll, setApplyToAll] = React.useState(false);
    const [selected, setSelected] = React.useState<Set<string>>(new Set());
    const [detailRow, setDetailRow] = React.useState<PbxFieldCompareRow | null>(null);
    const [deleteRow, setDeleteRow] = React.useState<PbxFieldCompareRow | null>(null);
    const [createOpen, setCreateOpen] = React.useState(false);
    const [manualCodes, setManualCodes] = React.useState('');

    const {
        rows,
        availableTypes,
        isLoading,
        searchActive,
        installTemplate,
        installConstants,
        installFields,
        deleteFields,
        deleteFieldItem,
        editFieldItem,
    } = usePbxFields(adapter, { domain, group, variant, search, typeFilter });

    // Drop a stale type filter when the variant/group change swaps the type set.
    React.useEffect(() => {
        if (typeFilter !== ALL_FIELD_TYPES && !availableTypes.includes(typeFilter)) {
            setTypeFilter(ALL_FIELD_TYPES);
        }
    }, [availableTypes, typeFilter]);

    const effectiveDomain = allowAllPortals && applyToAll ? 'all' : domain ?? '';

    // «От шаблона»: показываем только поля шаблона выбранной группы/варианта,
    // пряча установленные-но-не-шаблонные (orphan) поля. Для сущностей без
    // источника шаблона (caps.template=false) фильтр не применяется.
    const templateActive = caps.template && templateOnly;
    const visibleRows = templateActive
        ? rows.filter((r) => r.inTemplate)
        : rows;
    const emptyMessage =
        templateActive && !searchActive && rows.every((r) => !r.inTemplate)
            ? 'По текущему состоянию шаблонов нет для выбранной группы/варианта. ' +
              'Снимите «Только из шаблона», чтобы увидеть установленные поля.'
            : 'Поля не найдены';

    // Keep the open detail dialog bound to the freshest row after mutations.
    const detailLive = detailRow
        ? (rows.find((r) => r.code === detailRow.code) ?? detailRow)
        : null;

    const toggleSelect = (code: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(code)) next.delete(code);
            else next.add(code);
            return next;
        });

    const toggleSelectAll = (checked: boolean) =>
        setSelected(
            checked
                ? new Set(rows.filter((r) => r.inTemplate).map((r) => r.code))
                : new Set(),
        );

    const selectedCount = rows.filter(
        (r) => selected.has(r.code) && r.inTemplate,
    ).length;

    const syncSelected = async () => {
        if (!domain) return;
        const fields = rows
            .filter((r) => selected.has(r.code) && r.template)
            .map((r) => r.template!);
        if (fields.length === 0) return;
        await installFields.mutateAsync(fields);
        setSelected(new Set());
    };

    const deleteByCodes = async () => {
        const codes = manualCodes
            .split(/[\n,]/)
            .map((c) => c.trim())
            .filter(Boolean);
        if (codes.length === 0) return;
        await deleteFields.mutateAsync({ domain: effectiveDomain, codes });
        setManualCodes('');
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
            <div className="flex items-center justify-between gap-4">
                <div>
                    {!lockedScope && (
                        <h1 className="text-2xl font-bold">{adapter.label}</h1>
                    )}
                    <p className="text-sm text-muted-foreground">
                        Портал: {domain ?? '…'}
                    </p>
                </div>
                <Button variant="outline" onClick={() => setCreateOpen(true)}>
                    Создать поле
                </Button>
            </div>

            <div className="space-y-3 rounded-md border p-3">
                {/* Scope — задаёт только то, какие поля считаются «шаблонными». */}
                {caps.template &&
                    !lockedScope &&
                    (adapter.groupOptions.length > 0 ||
                        adapter.variantOptions.length > 0) && (
                    <div className="flex flex-wrap items-end gap-3">
                        <span className="w-24 self-center text-sm font-medium">
                            Шаблон
                        </span>
                        {adapter.groupOptions.length > 0 && (
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
                        )}
                        {adapter.variantOptions.length > 0 && (
                            <div className="space-y-1">
                                <Label>{adapter.variantLabel}</Label>
                                <Select value={variant} onValueChange={setVariant}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {adapter.variantOptions.map((a) => (
                                            <SelectItem key={a.value} value={a.value}>
                                                {a.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <p className="min-w-[220px] flex-1 self-center text-xs text-muted-foreground">
                            Определяет, какие поля считаются «шаблонными» (колонка
                            «Шаблон»). На колонки Bitrix и БД не влияет — там всегда
                            все поля портала.
                        </p>
                    </div>
                )}

                {/* Filter — сужает уже загруженные строки таблицы (клиентский). */}
                {caps.template && (
                    <div className="flex flex-wrap items-end gap-3 border-t pt-3">
                        <span className="w-24 self-center text-sm font-medium">
                            Фильтр
                        </span>
                        <div className="min-w-[200px] flex-1 space-y-1">
                            <Label>Поиск</Label>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="code / name / type / значение списка…"
                            />
                        </div>
                        {availableTypes.length > 0 && (
                            <div className="space-y-1">
                                <Label>Тип</Label>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL_FIELD_TYPES}>
                                            Все типы
                                        </SelectItem>
                                        {availableTypes.map((t) => (
                                            <SelectItem key={t} value={t}>
                                                {t}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <label
                            className="flex items-center gap-2 self-center text-sm"
                            title="Скрыть orphan-поля: те, что есть в Bitrix/БД, но отсутствуют в шаблоне выбранной группы/варианта"
                        >
                            <Checkbox
                                checked={templateOnly}
                                onCheckedChange={(c) => setTemplateOnly(Boolean(c))}
                            />
                            Только из шаблона
                        </label>
                    </div>
                )}

                {/* Actions — установка / синхронизация. */}
                {(caps.template || caps.installFromConstants) && (
                    <div className="flex flex-wrap items-center gap-3 border-t pt-3">
                        <span className="w-24 self-center text-sm font-medium">
                            Действия
                        </span>
                        {caps.template && (
                            <>
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
                                        Устанавливает на портал все поля шаблона для выбранной
                                        группы и варианта (поля читаются из Excel-файла сервиса):
                                        создаёт отсутствующие в Bitrix и обновляет существующие,
                                        затем зеркалит в PortalDB. Повторный запуск не плодит
                                        дубликаты.
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            onClick={syncSelected}
                                            disabled={
                                                installFields.isPending || selectedCount === 0
                                            }
                                        >
                                            {installFields.isPending
                                                ? 'Синхронизация…'
                                                : `Синхронизировать выбранные (${selectedCount})`}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        Устанавливает/обновляет в Bitrix и PortalDB только
                                        отмеченные поля. Поля передаются напрямую (без чтения
                                        Excel) — удобно для точечной повторной синхронизации.
                                    </TooltipContent>
                                </Tooltip>
                            </>
                        )}
                        {caps.installFromConstants && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        onClick={() => installConstants.mutate()}
                                        disabled={installConstants.isPending || !domain}
                                    >
                                        {installConstants.isPending
                                            ? 'Установка…'
                                            : 'Установить из констант'}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    Устанавливает поля из констант приложения (без Excel),
                                    создавая/обновляя их в Bitrix. Для части сущностей (напр.
                                    Task) синхронизация с PortalDB не выполняется.
                                </TooltipContent>
                            </Tooltip>
                        )}
                    </div>
                )}
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
                    Фильтр
                    {search.trim() ? ` по «${search.trim()}»` : ''}
                    {typeFilter !== ALL_FIELD_TYPES ? ` · тип «${typeFilter}»` : ''}:
                    найдено {visibleRows.length} — показаны только совпадения (сбросьте
                    поиск и тип, чтобы вернуть все).
                </p>
            )}

            {caps.monitoring ? (
                <PbxFieldsCompareTable
                    rows={visibleRows}
                    isLoading={isLoading}
                    selectable={caps.template}
                    selectedCodes={selected}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onOpenDetail={setDetailRow}
                    onDeleteField={setDeleteRow}
                    emptyMessage={emptyMessage}
                />
            ) : (
                <div className="space-y-2 rounded-md border p-3">
                    <Label>Удалить поля по кодам (через запятую или с новой строки)</Label>
                    <Textarea
                        value={manualCodes}
                        onChange={(e) => setManualCodes(e.target.value)}
                        className="min-h-[80px]"
                        placeholder="code1, code2"
                    />
                    <Button
                        variant="destructive"
                        onClick={deleteByCodes}
                        disabled={deleteFields.isPending || !manualCodes.trim()}
                    >
                        Удалить
                    </Button>
                    <p className="text-xs text-muted-foreground">
                        У сущности нет источника списка полей — управление по кодам.
                    </p>
                </div>
            )}

            <PbxFieldDetailDialog
                open={Boolean(detailRow)}
                onOpenChange={(o) => !o && setDetailRow(null)}
                row={detailLive}
                domain={effectiveDomain}
                canSync={Boolean(detailLive?.template)}
                isPending={
                    installFields.isPending ||
                    editFieldItem.isPending ||
                    deleteFieldItem.isPending
                }
                onSync={async () => {
                    if (!domain || !detailLive?.template) return;
                    await installFields.mutateAsync([detailLive.template]);
                }}
                onEditItem={(itemCode, newValue) =>
                    editFieldItem.mutateAsync({
                        domain: effectiveDomain,
                        fieldCode: detailLive?.code ?? '',
                        itemCode,
                        newValue,
                    })
                }
                onDeleteItem={(itemCode) =>
                    deleteFieldItem.mutateAsync({
                        domain: effectiveDomain,
                        fieldCode: detailLive?.code ?? '',
                        itemCode,
                    })
                }
            />

            <PbxFieldFormDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                isSubmitting={installFields.isPending}
                onSubmit={async (field) => {
                    if (!domain) return;
                    await installFields.mutateAsync([field]);
                    setCreateOpen(false);
                }}
            />

            <ConfirmDialog
                open={Boolean(deleteRow)}
                onOpenChange={(o) => !o && setDeleteRow(null)}
                title="Удалить поле?"
                description={`Удалить поле «${deleteRow?.name ?? ''}» (${
                    deleteRow?.code ?? ''
                }) из Bitrix и PortalDB?${
                    applyToAll ? ' Операция затронет ВСЕ порталы.' : ''
                }`}
                confirmLabel="Удалить"
                variant="destructive"
                onConfirm={async () => {
                    if (!deleteRow) return;
                    await deleteFields.mutateAsync({
                        domain: effectiveDomain,
                        codes: [deleteRow.code],
                    });
                    setDeleteRow(null);
                }}
            />
        </div>
    );
}
