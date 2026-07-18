'use client';

import * as React from 'react';
import { InstallComponentDto } from '@workspace/nest-admin-api';
import { DataTable, Column } from '@/modules/shared';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { ComponentStatusBadge } from '../status-badge/domain-badges';

const COMPONENT_TYPE_TITLES: Record<string, string> = {
    placement: 'Виджеты',
    smart_scenario: 'Умные сценарии',
    pbx_entities: 'Поля и процессы CRM',
};

const COMPONENT_TYPE_ORDER = ['placement', 'smart_scenario', 'pbx_entities'];

interface InstallComponentsSectionProps {
    components: InstallComponentDto[];
    isLoading?: boolean;
}

const columns: Column<InstallComponentDto>[] = [
    {
        id: 'componentCode',
        header: 'Компонент',
        cell: (row) =>
            row.componentCode ? (
                <span className="font-mono text-xs">{row.componentCode}</span>
            ) : (
                <span className="text-muted-foreground">все сущности</span>
            ),
    },
    {
        id: 'productCode',
        header: 'Продукт',
        accessorKey: 'productCode',
        className: 'w-28',
    },
    {
        id: 'status',
        header: 'Статус',
        cell: (row) => <ComponentStatusBadge component={row} />,
        className: 'w-52',
    },
    {
        id: 'attempts',
        header: 'Попыток',
        accessorKey: 'attempts',
        className: 'w-24',
    },
];

/**
 * Компоненты установки, сгруппированные по оси (componentType)
 * с русскими заголовками групп. Переиспользуется в деталке заявки и установки.
 */
export function InstallComponentsSection({
    components,
    isLoading,
}: InstallComponentsSectionProps) {
    const groups = React.useMemo(() => {
        const byType = new Map<string, InstallComponentDto[]>();
        for (const component of components) {
            const list = byType.get(component.componentType) ?? [];
            list.push(component);
            byType.set(component.componentType, list);
        }
        const knownFirst = [
            ...COMPONENT_TYPE_ORDER,
            ...[...byType.keys()].filter((t) => !COMPONENT_TYPE_ORDER.includes(t)),
        ];
        return knownFirst
            .filter((type) => byType.has(type))
            .map((type) => ({
                type,
                title: COMPONENT_TYPE_TITLES[type] ?? type,
                items: byType.get(type) as InstallComponentDto[],
            }));
    }, [components]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Компоненты установки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading && (
                    <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                )}
                {!isLoading && groups.length === 0 && (
                    <div className="text-muted-foreground text-sm">
                        Компоненты установки отсутствуют
                    </div>
                )}
                {!isLoading &&
                    groups.map((group) => (
                        <div key={group.type} className="space-y-2">
                            <h3 className="text-sm font-semibold">{group.title}</h3>
                            <DataTable
                                data={group.items}
                                columns={columns}
                                emptyMessage="Нет компонентов"
                            />
                        </div>
                    ))}
            </CardContent>
        </Card>
    );
}
