'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    FieldList,
    formatCriteriaList,
    formatFieldValue,
    formatSupplyReportFieldList,
    getClientTypeLabel,
    getSupplyTypeLabel,
    type FieldRow,
} from '@/modules/entities/konstructor/lib';
import type { ISupplyReportTemplate } from '../../model';

interface SupplyReportTemplateCardProps {
    item: ISupplyReportTemplate;
    onDownload?: () => void;
    onDownloadDemo?: () => void;
    onSetActive?: () => void;
    onSetDefault?: () => void;
    onArchive?: () => void;
    onDelete?: () => void;
}

const formatDate = (value?: string | null): string =>
    value ? new Date(value).toLocaleString('ru-RU') : '—';

export function SupplyReportTemplateCard({
    item,
    onDownload,
    onDownloadDemo,
    onSetActive,
    onSetDefault,
    onArchive,
    onDelete,
}: SupplyReportTemplateCardProps) {
    const rows: FieldRow[] = [
        { label: 'ID', value: item.id },
        { label: 'Код', value: formatFieldValue(item.code) },
        // portal_id IS NULL — это «Общий», а не потеря данных.
        { label: 'Портал', value: item.portal_id ?? 'Общий' },
        { label: 'Поставщик', value: item.agent_id ?? 'Любой' },
        {
            label: 'Типы клиента',
            value: formatCriteriaList(item.client_types, getClientTypeLabel),
        },
        {
            label: 'Виды размещения',
            value: formatCriteriaList(item.supply_types, getSupplyTypeLabel),
        },
        {
            label: 'Обязательные поля формы',
            value: formatSupplyReportFieldList(item.required_fields),
        },
        {
            label: 'Необязательные поля формы',
            value: formatSupplyReportFieldList(item.optional_fields),
        },
        { label: 'Описание', value: formatFieldValue(item.description) },
        { label: 'По умолчанию', value: formatFieldValue(item.is_default) },
        { label: 'Активен', value: formatFieldValue(item.is_active) },
        { label: 'В архиве', value: formatFieldValue(item.is_archived) },
        { label: 'Архивирован', value: formatDate(item.archived_at) },
        {
            label: 'Создал (ID в Битрикс)',
            value: formatFieldValue(item.creator_bitrix_user_id),
        },
        { label: 'Создан', value: formatDate(item.created_at) },
        { label: 'Изменён', value: formatDate(item.updated_at) },
        { label: 'Файл шаблона', value: item.template_url ? 'Загружен' : '—' },
        { label: 'Демо-файл', value: item.demo_url ? 'Загружен' : '—' },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>Шаблон отчёта о поставке</CardDescription>
            </CardHeader>
            <CardContent>
                <FieldList rows={rows} />
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {onDownload && (
                    <Button variant="outline" onClick={onDownload}>
                        Скачать DOCX
                    </Button>
                )}
                {onDownloadDemo && item.demo_url && (
                    <Button variant="outline" onClick={onDownloadDemo}>
                        Скачать демо
                    </Button>
                )}
                {onSetActive && (
                    <Button variant="outline" onClick={onSetActive}>
                        {item.is_active ? 'Выключить' : 'Включить'}
                    </Button>
                )}
                {onSetDefault && (
                    <Button
                        variant="outline"
                        onClick={onSetDefault}
                        disabled={item.is_default}
                    >
                        Сделать шаблоном по умолчанию
                    </Button>
                )}
                {onArchive && (
                    <Button variant="outline" onClick={onArchive}>
                        {item.is_archived
                            ? 'Вернуть из архива'
                            : 'Отправить в архив'}
                    </Button>
                )}
                {onDelete && (
                    <Button variant="destructive" onClick={onDelete}>
                        Удалить
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
