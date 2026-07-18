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
import type { ListTemplate } from '../../../model';

/**
 * Поля одного эталонного списка со всеми кодами: короткий code, полный CODE
 * (каким он должен стать в Bitrix), btx-код из Excel и параметры установки.
 * Строка enum-поля разворачивается в список значений (VALUE / CODE / SORT).
 */
export function TemplateFieldsTable({ list }: { list: ListTemplate }) {
    const [expandedCode, setExpandedCode] = React.useState<string | null>(null);

    return (
        <div className="overflow-x-auto rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-8" />
                        <TableHead>Название</TableHead>
                        <HeadWithHint
                            label="code"
                            hint="Внутренний код поля в April — стабильный ключ для поиска поля во всех операциях."
                            className="w-36"
                        />
                        <HeadWithHint
                            label="полный CODE"
                            hint="`группа_тип_код` — таким CODE свойство должно быть в Bitrix и таким его ищет мониторинг."
                            className="w-56"
                        />
                        <HeadWithHint
                            label="btx"
                            hint="btx-код из Excel-шаблона (bxFieldName)."
                            className="w-36"
                        />
                        <TableHead className="w-28">Тип</TableHead>
                        <HeadWithHint
                            label="upd"
                            hint="isNeedUpdate: обновлять ли поле при повторной установке. «нет» — установка пропускает поле."
                            className="w-16 text-center"
                        />
                        <TableHead className="w-16 text-center">order</TableHead>
                        <TableHead className="w-20 text-center">items</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {list.fields.map((field) => {
                        const items = field.list ?? [];
                        const expandable = items.length > 0;
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
                                    <TableCell className="font-medium">
                                        {field.name}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.code}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {`${list.group}_${list.type}_${field.code}`}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {field.bxFieldName || '—'}
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                        {field.type}
                                        {field.isMultiple ? ' ×N' : ''}
                                    </TableCell>
                                    <TableCell className="text-center text-xs">
                                        {field.isNeedUpdate ? 'да' : 'нет'}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs">
                                        {field.order}
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-xs">
                                        {items.length || '—'}
                                    </TableCell>
                                </TableRow>
                                {expandedCode === field.code && expandable && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={9}
                                            className="bg-muted/30"
                                        >
                                            <ul className="ml-4 list-disc text-xs">
                                                {items.map((item) => (
                                                    <li key={item.CODE}>
                                                        {item.VALUE}{' '}
                                                        <span className="font-mono text-muted-foreground">
                                                            ({item.CODE}, sort{' '}
                                                            {item.SORT}
                                                            {item.DEL === 'Y'
                                                                ? ', DEL'
                                                                : ''}
                                                            )
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
