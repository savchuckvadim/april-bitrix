'use client';

import { Card } from '@workspace/ui/components/card';
import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import type { InvoiceTemplate } from '@/modules/entities/invoice-template';
import { InvoiceTemplateRow } from './InvoiceTemplateRow';

export interface InvoiceTemplateTableItem {
    template: InvoiceTemplate;
    bindingLabel: string;
    canManage: boolean;
}

export interface InvoiceTemplateTableProps {
    items: readonly InvoiceTemplateTableItem[];
    busyId: string | null;
    onToggleActive: (template: InvoiceTemplate, isActive: boolean) => void;
    onToggleDefault: (template: InvoiceTemplate) => void;
    onToggleArchive: (template: InvoiceTemplate) => void;
    onDownload: (template: InvoiceTemplate) => void;
    onEdit: (template: InvoiceTemplate) => void;
    onDelete: (template: InvoiceTemplate) => void;
}

/** Таблица шаблонов счетов: привязка, критерии подбора, статус и действия. */
export const InvoiceTemplateTable = ({
    items,
    busyId,
    onToggleActive,
    onToggleDefault,
    onToggleArchive,
    onDownload,
    onEdit,
    onDelete,
}: InvoiceTemplateTableProps) => (
    <Card className="gap-0 overflow-hidden py-0">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Привязка</TableHead>
                    <TableHead>Тип клиента</TableHead>
                    <TableHead>Тип поставки</TableHead>
                    <TableHead>Отметки</TableHead>
                    <TableHead>Активен</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(({ template, bindingLabel, canManage }) => (
                    <InvoiceTemplateRow
                        key={template.id}
                        template={template}
                        bindingLabel={bindingLabel}
                        canManage={canManage}
                        isBusy={busyId === template.id}
                        onToggleActive={isActive => onToggleActive(template, isActive)}
                        onToggleDefault={() => onToggleDefault(template)}
                        onToggleArchive={() => onToggleArchive(template)}
                        onDownload={() => onDownload(template)}
                        onEdit={() => onEdit(template)}
                        onDelete={() => onDelete(template)}
                    />
                ))}
            </TableBody>
        </Table>
    </Card>
);
