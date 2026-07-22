'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/hooks';
import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { HeadWithHint } from '../../../../lib/ui';
import { getApiErrorMessage } from '../../../../lib/api-error';
import {
    SMART_NAMES,
    TYPED_GROUPS,
    type SmartName,
    type TypedGroup,
} from '../../../../lib/model/common';
import {
    useConstSmartRegistry,
    usePortalDbSmarts,
    useReinstallSmart,
} from '../../lib/hooks';
import { DbSmartRow } from './components/DbSmartRow';
import { InstallAicallDialog } from './components/InstallAicallDialog';
import { FILTER_ALL, SmartsFilterBar } from './components/SmartsFilterBar';

const isSmartName = (value: string): value is SmartName =>
    SMART_NAMES.some((option) => option.value === value);
const isTypedGroup = (value: string): value is TypedGroup =>
    TYPED_GROUPS.some((option) => option.value === value);

const uniqueSorted = (values: string[]): string[] =>
    Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ru'));

/**
 * Смарт-процессы портала из PortalDB (`smarts`, admin API). Все строки
 * грузятся одним запросом без серверных фильтров; фильтрация по группе/типу
 * и поиск выполняются на клиенте. Строка разворачивается в детали (живое
 * состояние Bitrix: поля, воронки со стадиями). Здесь же — установка смарта
 * «AI-анализ звонков».
 */
export function DbSmartsPanel({ portalId }: { portalId: number }) {
    const router = useRouter();
    const pathname = usePathname();
    const portal = usePortal(portalId);
    const domain = portal.data?.domain;

    const smarts = usePortalDbSmarts(portalId);
    const registry = useConstSmartRegistry();
    const reinstall = useReinstallSmart(domain);

    const [group, setGroup] = React.useState<string>(FILTER_ALL);
    const [type, setType] = React.useState<string>(FILTER_ALL);
    const [search, setSearch] = React.useState('');
    const [expandedId, setExpandedId] = React.useState<number | null>(null);
    const [aicallOpen, setAicallOpen] = React.useState(false);

    const rows = React.useMemo(() => smarts.data ?? [], [smarts.data]);
    const groupOptions = React.useMemo(
        () => uniqueSorted(rows.map((s) => s.group)),
        [rows],
    );
    const typeOptions = React.useMemo(
        () => uniqueSorted(rows.map((s) => s.type)),
        [rows],
    );

    const filtered = React.useMemo(() => {
        const query = search.trim().toLowerCase();
        return rows.filter((s) => {
            if (group !== FILTER_ALL && s.group !== group) return false;
            if (type !== FILTER_ALL && s.type !== type) return false;
            if (!query) return true;
            return [
                s.name,
                s.title,
                s.type,
                s.group,
                String(s.entityTypeId),
                String(s.id),
            ].some((value) => value.toLowerCase().includes(query));
        });
    }, [rows, group, type, search]);

    const toggle = (id: number) =>
        setExpandedId((current) => (current === id ? null : id));

    return (
        <div className="space-y-4">
            <SmartsFilterBar
                group={group}
                type={type}
                search={search}
                groupOptions={groupOptions}
                typeOptions={typeOptions}
                onGroupChange={setGroup}
                onTypeChange={setType}
                onSearchChange={setSearch}
                onInstallAicall={() => setAicallOpen(true)}
            />

            {smarts.isPending ? (
                <p className="text-sm text-muted-foreground">
                    Загрузка смартов…
                </p>
            ) : smarts.isError ? (
                <div className="space-y-2">
                    <p className="text-sm text-destructive">
                        {getApiErrorMessage(
                            smarts.error,
                            'Не удалось загрузить смарты портала',
                        )}
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void smarts.refetch()}
                    >
                        Повторить
                    </Button>
                </div>
            ) : rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    В PortalDB (`smarts`) записей для этого портала нет —
                    смарты ещё не устанавливались.
                </p>
            ) : (
                <>
                    <p className="text-xs text-muted-foreground">
                        Показано {filtered.length} из {rows.length}. Все смарты
                        загружены одним запросом, фильтры и поиск работают на
                        клиенте.
                    </p>
                    {filtered.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            Под выбранные фильтры не попал ни один смарт.
                        </p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8" />
                                        <TableHead>Название</TableHead>
                                        <HeadWithHint
                                            label="Тип"
                                            hint="`smarts.type` — тип записи смарта в PortalDB."
                                            className="w-32"
                                        />
                                        <HeadWithHint
                                            label="Группа"
                                            hint="`smarts.group` — группа смарта (sales/service/general)."
                                            className="w-28"
                                        />
                                        <HeadWithHint
                                            label="entityTypeId"
                                            hint="ID типа смарт-процесса в CRM Bitrix (crm.type)."
                                            className="w-28"
                                        />
                                        <TableHead className="w-72">
                                            Действия
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((smart) => {
                                        const template =
                                            isSmartName(smart.name) &&
                                            isTypedGroup(smart.group)
                                                ? {
                                                      name: smart.name,
                                                      group: smart.group,
                                                  }
                                                : null;
                                        const installing =
                                            reinstall.isPending &&
                                            reinstall.variables?.name ===
                                                smart.name &&
                                            reinstall.variables?.group ===
                                                smart.group;
                                        // Страница сопоставления
                                        // [group]/[variant]: excel — по name,
                                        // const — по type (name у него русский
                                        // title, кириллица в URL). Manual-
                                        // смарты эталона не имеют — «Открыть»
                                        // ведёт на страницу реальных данных.
                                        const isConst = registry.data?.items.some(
                                            (item) =>
                                                item.type === smart.type &&
                                                item.group === smart.group,
                                        );
                                        const openHref = template
                                            ? `${pathname}/${smart.group}/${smart.name}`
                                            : isConst
                                              ? `${pathname}/${smart.group}/${smart.type}`
                                              : `${pathname}/db/${smart.id}`;
                                        return (
                                            <DbSmartRow
                                                key={smart.id}
                                                smart={smart}
                                                expanded={
                                                    expandedId === smart.id
                                                }
                                                onToggle={() =>
                                                    toggle(smart.id)
                                                }
                                                onOpen={() =>
                                                    router.push(openHref)
                                                }
                                                showInstall={template !== null}
                                                installDisabled={
                                                    !domain || installing
                                                }
                                                installing={installing}
                                                onInstall={() =>
                                                    template &&
                                                    reinstall.mutate(template)
                                                }
                                            />
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </>
            )}

            <InstallAicallDialog
                open={aicallOpen}
                onOpenChange={setAicallOpen}
                portalDomain={domain}
            />
        </div>
    );
}
