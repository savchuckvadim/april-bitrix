'use client';

import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { Button } from '@workspace/ui/components/button';
import { HeadWithHint } from '../../../../lib/ui';
import type { PortalListField } from '../../../model';

/**
 * Зеркало полей списка в PortalDB (`bitrixfields`): все идентификаторы,
 * по которым интеграции пишут в Bitrix. Строка enum-поля разворачивается
 * в значения `bitrixfield_items` с их bitrixId.
 */
export function DbFieldsTable({ fields }: { fields: PortalListField[] }) {
    const [expandedCode, setExpandedCode] = React.useState<string | null>(null);

    if (fields.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                Полей в зеркале нет.
            </p>
        );
    }

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8" />
                        <TableHead className="w-16">id</TableHead>
                        <TableHead>Название</TableHead>
                        <HeadWithHint
                            label="code"
                            hint="Короткий код поля в April (`bitrixfields.code`) — стабильный ключ поиска."
                            className="w-40"
                        />
                        <HeadWithHint
                            label="bitrixId (CODE)"
                            hint="CODE свойства в Bitrix, сохранённый при установке."
                            className="w-56"
                        />
                        <HeadWithHint
                            label="bitrixCamelId (FIELD_ID)"
                            hint="FIELD_ID свойства (PROPERTY_N) — его интеграции передают в lists.element.*."
                            className="w-40"
                        />
                        <TableHead className="w-28">Тип</TableHead>
                        <TableHead className="w-20 text-center">items</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fields.map((field) => {
                        const expandable = field.items.length > 0;
                        return (
                            <React.Fragment key={field.code}>
                                <TableRow>
                                    <TableCell>
                                        {expandable && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0"
                                                onClick={() =>
                                                    setExpandedCode(
                                                        expandedCode ===
                                                            field.code
                                                            ? null
                                                            : field.code,
                                                    )
                                                }
                                            >
                                                {expandedCode === field.code ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.id ?? '—'}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {field.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.code}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {field.bitrixId || '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.bitrixCamelId || '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.type}
                                        {field.isPlural ? ' ×N' : ''}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs">
                                        {field.items.length || '—'}
                                    </TableCell>
                                </TableRow>
                                {expandedCode === field.code && expandable && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            className="bg-muted/30"
                                        >
                                            <ul className="ml-4 list-disc text-xs">
                                                {field.items.map((item) => (
                                                    <li
                                                        key={`${item.code}_${item.bitrixId}`}
                                                    >
                                                        {item.name}{' '}
                                                        <span className="font-mono text-muted-foreground">
                                                            ({item.code},
                                                            bitrixId{' '}
                                                            {item.bitrixId})
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </React.Fragment>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
