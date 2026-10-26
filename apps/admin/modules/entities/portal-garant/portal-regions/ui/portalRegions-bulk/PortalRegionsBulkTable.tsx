'use client';

import * as React from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { GetPortalRegionResponseDto } from '@workspace/nest-admin-api';
import type { PendingRegionChange } from '../../lib/hooks/use-portalRegions-bulk';

interface PortalRegionsBulkTableProps {
    regions: GetPortalRegionResponseDto[];
    isLoading?: boolean;
    /** Состояние региона с учётом несохранённых правок */
    effective: (regionId: number) => PendingRegionChange;
    changes: Map<number, PendingRegionChange>;
    onToggle: (regionId: number, enabled: boolean) => void;
    onOwnAbsChange: (regionId: number, ownAbs: string | null) => void;
}

/**
 * Регионы портала: галочка доступности и своя цена рабса. Правки видны
 * сразу, в систему уходят по кнопке «Сохранить».
 */
export function PortalRegionsBulkTable({
    regions,
    isLoading,
    effective,
    changes,
    onToggle,
    onOwnAbsChange,
}: PortalRegionsBulkTableProps) {
    if (isLoading) {
        return (
            <p className="text-muted-foreground py-6 text-sm">
                Загружаем регионы…
            </p>
        );
    }
    if (regions.length === 0) {
        return (
            <p className="text-muted-foreground py-6 text-sm">
                Регионы не найдены.
            </p>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-16">Доступен</TableHead>
                    <TableHead>Регион</TableHead>
                    <TableHead className="w-28">Код</TableHead>
                    <TableHead className="w-32">Рабс региона</TableHead>
                    <TableHead className="w-56">Свой рабс портала</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {regions.map(region => {
                    const regionId = Number(region.id);
                    const state = effective(regionId);
                    const pending = changes.get(regionId);
                    const ownAbsDraft = pending?.ownAbs;

                    return (
                        <TableRow
                            key={region.id}
                            className={pending ? 'bg-muted/40' : undefined}
                        >
                            <TableCell>
                                <Checkbox
                                    checked={state.enabled}
                                    onCheckedChange={checked =>
                                        onToggle(regionId, checked === true)
                                    }
                                    aria-label={`Регион ${region.title}`}
                                />
                            </TableCell>
                            <TableCell className="font-medium">
                                {region.title}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                                {region.code}
                            </TableCell>
                            <TableCell>{region.abs}</TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1">
                                    <Input
                                        value={ownAbsDraft ?? ''}
                                        placeholder="как у региона"
                                        disabled={!state.enabled}
                                        onChange={event =>
                                            onOwnAbsChange(
                                                regionId,
                                                event.target.value === ''
                                                    ? null
                                                    : event.target.value,
                                            )
                                        }
                                        className="h-8"
                                    />
                                    {ownAbsDraft != null && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                onOwnAbsChange(regionId, null)
                                            }
                                        >
                                            Сбросить
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
