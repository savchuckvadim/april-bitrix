'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import type { BulkSetPortalRegionsResultDto } from '@workspace/nest-admin-api';

interface PortalRegionsBulkBarProps {
    changesCount: number;
    isSaving: boolean;
    result: BulkSetPortalRegionsResultDto | null;
    error: Error | null;
    onSave: () => void;
    onReset: () => void;
}

/**
 * Панель несохранённых правок регионов портала: галочки и свои рабсы
 * копятся, уходят в систему одним нажатием.
 */
export function PortalRegionsBulkBar({
    changesCount,
    isSaving,
    result,
    error,
    onSave,
    onReset,
}: PortalRegionsBulkBarProps) {
    const hasChanges = changesCount > 0;

    return (
        <div className="space-y-3">
            <div className="bg-muted/40 flex flex-wrap items-center gap-3 rounded-md border p-3">
                <div className="flex-1 text-sm">
                    {hasChanges ? (
                        <>
                            <span className="font-medium">
                                Не сохранено изменений: {changesCount}
                            </span>
                            <p className="text-muted-foreground">
                                Отметьте нужные регионы и при необходимости
                                задайте свой рабс, затем сохраните — всё уйдёт
                                одним действием.
                            </p>
                        </>
                    ) : (
                        <p className="text-muted-foreground">
                            Отметьте регионы, которые доступны этому порталу.
                            Свой рабс нужен, когда у портала особая цена —
                            часто его берут из рабса другого региона.
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <Button
                            variant="ghost"
                            onClick={onReset}
                            disabled={isSaving}
                        >
                            Отменить правки
                        </Button>
                    )}
                    <Button
                        onClick={onSave}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? 'Сохраняем…' : 'Сохранить'}
                    </Button>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>
                        Не удалось сохранить: {error.message}
                    </AlertDescription>
                </Alert>
            )}

            {result && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium">Сохранено:</span>
                    {result.enabled > 0 && (
                        <Badge>включено регионов: {result.enabled}</Badge>
                    )}
                    {result.disabled > 0 && (
                        <Badge variant="secondary">
                            выключено: {result.disabled}
                        </Badge>
                    )}
                    {result.updatedOwn > 0 && (
                        <Badge variant="secondary">
                            свой рабс задан: {result.updatedOwn}
                        </Badge>
                    )}
                    {result.skipped.length > 0 && (
                        <Badge variant="destructive">
                            не получилось: {result.skipped.length}
                        </Badge>
                    )}
                    {result.enabled === 0 &&
                        result.disabled === 0 &&
                        result.updatedOwn === 0 &&
                        result.skipped.length === 0 && (
                            <Badge variant="secondary">
                                всё уже было так
                            </Badge>
                        )}
                </div>
            )}

            {result && result.skipped.length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        <ul className="list-disc pl-5">
                            {result.skipped.map(row => (
                                <li key={row.regionId}>
                                    регион №{row.regionId}: {row.reason}
                                </li>
                            ))}
                        </ul>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
