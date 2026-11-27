'use client';

import { Download, Pencil } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { Switch } from '@workspace/ui/components/switch';
import { TableCell, TableRow } from '@workspace/ui/components/table';
import { cn } from '@workspace/ui/lib/utils';
import {
    formatCriteriaList,
    invoiceClientTypeLabel,
    invoiceSupplyTypeLabel,
    type InvoiceTemplate,
} from '@/modules/entities/invoice-template';
import { InvoiceTemplateBadges } from './InvoiceTemplateBadges';
import { InvoiceTemplateRowMenu } from './InvoiceTemplateRowMenu';

export interface InvoiceTemplateRowProps {
    template: InvoiceTemplate;
    bindingLabel: string;
    /** Правка, флаги, архив и удаление доступны (общий шаблон правит суперпользователь). */
    canManage: boolean;
    /** Над строкой идёт действие: управление заблокировано. */
    isBusy: boolean;
    onToggleActive: (isActive: boolean) => void;
    onToggleDefault: () => void;
    onToggleArchive: () => void;
    onDownload: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

/** Строка таблицы шаблонов счетов. */
export const InvoiceTemplateRow = ({
    template,
    bindingLabel,
    canManage,
    isBusy,
    onToggleActive,
    onToggleDefault,
    onToggleArchive,
    onDownload,
    onEdit,
    onDelete,
}: InvoiceTemplateRowProps) => (
    <TableRow className={cn(template.isArchived && 'opacity-60')}>
        <TableCell className="max-w-72 whitespace-normal">
            <div className="font-medium">{template.name}</div>
            {template.description ? (
                <div className="line-clamp-2 text-xs text-muted-foreground">
                    {template.description}
                </div>
            ) : null}
        </TableCell>
        <TableCell>{bindingLabel}</TableCell>
        <TableCell className="whitespace-normal">
            {formatCriteriaList(template.clientTypes, invoiceClientTypeLabel)}
        </TableCell>
        <TableCell className="whitespace-normal">
            {formatCriteriaList(template.supplyTypes, invoiceSupplyTypeLabel)}
        </TableCell>
        <TableCell>
            <InvoiceTemplateBadges template={template} />
        </TableCell>
        <TableCell>
            <Switch
                checked={template.isActive}
                onCheckedChange={onToggleActive}
                disabled={!canManage || isBusy || template.isArchived}
                aria-label={`Шаблон «${template.name}» активен`}
            />
        </TableCell>
        <TableCell>
            <div className="flex items-center justify-end gap-1">
                <IconAction
                    icon={Download}
                    label="Скачать .docx"
                    disabled={isBusy}
                    onClick={onDownload}
                />
                {canManage ? (
                    <>
                        <IconAction
                            icon={Pencil}
                            label="Править"
                            disabled={isBusy}
                            onClick={onEdit}
                        />
                        <InvoiceTemplateRowMenu
                            isDefault={template.isDefault}
                            isArchived={template.isArchived}
                            disabled={isBusy}
                            onToggleDefault={onToggleDefault}
                            onToggleArchive={onToggleArchive}
                            onDelete={onDelete}
                        />
                    </>
                ) : null}
            </div>
        </TableCell>
    </TableRow>
);
