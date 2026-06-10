'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ACard } from '@workspace/ui';
import { Column, DataTable } from '@/modules/shared/ui/data-table';
import { GenericEntity, Scalar } from '../types';
import {
    extractNestedCollections,
    formatScalar,
    getEntityLabel,
    isScalar,
} from '../utils';

interface NestedEntitiesExplorerProps {
    rootLabel: string;
    rootData: GenericEntity[];
    emptyActionLabel?: string;
    onEmptyAction?: () => void;
    openFirstEntityByDefault?: boolean;
}

export function NestedEntitiesExplorer({
    rootLabel,
    rootData,
    emptyActionLabel,
    onEmptyAction,
    openFirstEntityByDefault = false,
}: NestedEntitiesExplorerProps) {
    const [stack, setStack] = React.useState<Array<{ label: string; data: GenericEntity[] }>>([
        { label: rootLabel, data: rootData },
    ]);
    const [selectedEntity, setSelectedEntity] = React.useState<GenericEntity | null>(null);

    React.useEffect(() => {
        setStack([{ label: rootLabel, data: rootData }]);
        setSelectedEntity(
            openFirstEntityByDefault && rootData.length > 0 ? (rootData[0] ?? null) : null
        );
    }, [rootLabel, rootData, openFirstEntityByDefault]);

    const current = stack[stack.length - 1];
    if (!current) return null;

    if (rootData.length === 0) {
        return (
            <ACard title={rootLabel} headerClassName="pb-2">
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Нет связанных элементов</span>
                    {onEmptyAction && (
                        <Button size="sm" onClick={onEmptyAction}>
                            {emptyActionLabel ?? 'Добавить'}
                        </Button>
                    )}
                </div>
            </ACard>
        );
    }

    const scalarKeys = Array.from(
        new Set(
            current.data.flatMap((item) =>
                Object.entries(item)
                    .filter(([, value]) => isScalar(value))
                    .map(([key]) => key)
            )
        )
    );

    const priorityKeys = ['id', 'title', 'name', 'code', 'type', 'isActive'];
    const orderedKeys = [
        ...priorityKeys.filter((key) => scalarKeys.includes(key)),
        ...scalarKeys.filter((key) => !priorityKeys.includes(key)),
    ].slice(0, 6);

    const columns: Column<GenericEntity>[] = orderedKeys.map((key) => ({
        id: key,
        header: key,
        className: key === 'id' ? 'w-20' : undefined,
        cell: (row) => formatScalar((row[key] as Scalar) ?? null),
    }));

    const childCollections = selectedEntity ? extractNestedCollections(selectedEntity) : [];
    const parentCrumbs = stack.slice(0, -1);

    return (
        <ACard
            title={current.label}
            headerClassName="space-y-3 pb-2"
            contentClassName="space-y-4"
            headerIcon={
                <div className="flex items-center gap-2">
                    {current.label}
                    <Badge variant="secondary">{current.data.length}</Badge>
                </div>
            }
        >
            {(parentCrumbs.length > 0 || childCollections.length > 0) && (
                <div className="flex flex-wrap items-center gap-2">
                    {parentCrumbs.map((crumb, index) => (
                        <Button
                            key={`${crumb.label}-${index}`}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStack((prev) => prev.slice(0, index + 1));
                                setSelectedEntity(null);
                            }}
                        >
                            {crumb.label}
                        </Button>
                    ))}

                    {childCollections.map((collection) => (
                        <Button
                            key={collection.key}
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setStack((prev) => [
                                    ...prev,
                                    {
                                        label: collection.key,
                                        data: collection.data,
                                    },
                                ]);
                                setSelectedEntity(null);
                            }}
                        >
                            {collection.key} ({collection.data.length})
                        </Button>
                    ))}
                </div>
            )}

            {!selectedEntity && (
                <div className="space-y-2">
                    <DataTable
                        data={current.data}
                        columns={columns}
                        onRowClick={setSelectedEntity}
                        emptyMessage="Нет данных"
                    />
                </div>
            )}

            {selectedEntity && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-base font-semibold">
                            {getEntityLabel(selectedEntity, 0)}
                        </h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedEntity(null)}
                        >
                            Назад к таблице
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                        {Object.entries(selectedEntity)
                            .filter(([, value]) => isScalar(value))
                            .map(([key, value]) => (
                                <div key={key} className="rounded-md border p-2 text-sm">
                                    <div className="text-xs uppercase text-muted-foreground">{key}</div>
                                    <div className="font-medium">{formatScalar(value as Scalar)}</div>
                                </div>
                            ))}
                    </div>

                </div>
            )}
        </ACard>
    );
}
