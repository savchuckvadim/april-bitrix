'use client';

import * as React from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Eye, Trash2 } from 'lucide-react';
import { DataTable, Column } from '@/modules/shared';
import {
    KNOWLEDGE_SHARED_SOURCE,
    KnowledgeDocument,
} from '../../lib/types/knowledge.types';

interface KnowledgeTableProps {
    data: KnowledgeDocument[];
    isLoading?: boolean;
    onView?: (document: KnowledgeDocument) => void;
    onDelete?: (document: KnowledgeDocument) => void;
}

/** Таблица документов базы знаний: файл, тип, источник, действия. */
export function KnowledgeTable({
    data,
    isLoading,
    onView,
    onDelete,
}: KnowledgeTableProps) {
    const columns: Column<KnowledgeDocument>[] = [
        {
            id: 'fileName',
            header: 'Файл',
            cell: (row) => <span className="font-medium">{row.fileName}</span>,
        },
        {
            id: 'kind',
            header: 'Тип',
            cell: (row) => (
                <span className="font-mono text-xs">{row.kind}</span>
            ),
            className: 'w-40',
        },
        {
            id: 'source',
            header: 'Источник',
            cell: (row) =>
                row.source === KNOWLEDGE_SHARED_SOURCE ? (
                    <Badge variant="secondary">Общая база</Badge>
                ) : (
                    <Badge variant="outline">{row.source}</Badge>
                ),
            className: 'w-64',
        },
        {
            id: 'actions',
            header: '',
            cell: (row) => (
                <div className="flex justify-end gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        title="Просмотреть извлечённый текст"
                        onClick={() => onView?.(row)}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        title="Удалить документ"
                        onClick={() => onDelete?.(row)}
                    >
                        <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                </div>
            ),
            className: 'w-24',
        },
    ];

    return (
        <DataTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            emptyMessage="Документов пока нет — загрузите первый файл"
        />
    );
}
