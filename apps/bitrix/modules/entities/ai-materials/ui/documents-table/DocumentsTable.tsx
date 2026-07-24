'use client';

import * as React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { ABadge, AIcon, PreloaderMicro } from '@workspace/april-ui';
import { Eye } from 'lucide-react';
import { AiSettingsDocumentDto } from '@workspace/nest-api';
import { AI_MATERIALS_TEXT_FILE_PATTERN } from '../../model/consts';

interface DocumentsTableProps {
    data: AiSettingsDocumentDto[];
    isLoading?: boolean;
    onView: (document: AiSettingsDocumentDto) => void;
    /** Правка текста; доступна только для своих .md/.txt/.json. */
    onEdit: (document: AiSettingsDocumentDto) => void;
    onDelete: (document: AiSettingsDocumentDto) => void;
}

/**
 * Таблица материалов раздела: свои документы (можно править/удалять)
 * и общие материалы April (только чтение). Таблица — @workspace/ui
 * (в april-ui нет универсальной таблицы), бэйджи/иконки — april-ui.
 */
export function DocumentsTable({
    data,
    isLoading,
    onView,
    onEdit,
    onDelete,
}: DocumentsTableProps) {
    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <PreloaderMicro phrase="Загружаем документы…" />
            </div>
        );
    }
    if (data.length === 0) {
        return (
            <p className="p-4 text-sm text-muted-foreground">
                Документов пока нет — создайте первый материал.
            </p>
        );
    }
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Файл</TableHead>
                    <TableHead className="w-40">Источник</TableHead>
                    <TableHead className="w-28" />
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((document) => (
                    <TableRow
                        key={`${document.source}:${document.fileName}`}
                    >
                        <TableCell className="font-medium">
                            {document.fileName}
                        </TableCell>
                        <TableCell>
                            <ABadge
                                size="xsmall"
                                isActive
                                color={document.editable ? 'april' : 'grey'}
                                title={
                                    document.editable ? 'Мой документ' : 'April'
                                }
                            />
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center justify-end gap-3">
                                <Eye
                                    className="h-5 w-5 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                                    onClick={() => onView(document)}
                                />
                                {document.editable &&
                                    AI_MATERIALS_TEXT_FILE_PATTERN.test(
                                        document.fileName,
                                    ) && (
                                        <AIcon
                                            type="update"
                                            action={() => onEdit(document)}
                                        />
                                    )}
                                {document.editable && (
                                    <AIcon
                                        type="delete"
                                        action={() => onDelete(document)}
                                    />
                                )}
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
