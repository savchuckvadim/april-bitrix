'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import {
    clientTypesLabel,
    supplyTypesLabel,
} from '@/modules/entities/konstructor/document-template-shared';
import {
    getInvoiceTemplateTypeLabel,
    getInvoiceTemplateVisibilityLabel,
} from '../../consts/invoice-template-form.consts';
import type { IInvoiceTemplate } from '../../model';

interface InvoiceTemplateCardProps {
    item: IInvoiceTemplate;
    onDownload?: () => void;
    onToggleActive?: () => void;
    onSetDefault?: () => void;
    onArchive?: () => void;
    onUnarchive?: () => void;
    onDelete?: () => void;
}

export function InvoiceTemplateCard({
    item,
    onDownload,
    onToggleActive,
    onSetDefault,
    onArchive,
    onUnarchive,
    onDelete,
}: InvoiceTemplateCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p>
                    <strong>ID:</strong> {item.id}
                </p>
                <p>
                    <strong>Код:</strong> {item.code}
                </p>
                <p>
                    <strong>Видимость:</strong>{' '}
                    {getInvoiceTemplateVisibilityLabel(item.visibility)}
                </p>
                <p>
                    {/* `portal_id IS NULL` — «Общий», а не пустое значение. */}
                    <strong>Портал:</strong> {item.portal_id ?? 'Общий'}
                </p>
                <p>
                    <strong>Поставщик:</strong> {item.agent_id ?? 'Любой'}
                </p>
                <p>
                    <strong>Типы клиента:</strong>{' '}
                    {clientTypesLabel(item.client_types)}
                </p>
                <p>
                    <strong>Виды размещения:</strong>{' '}
                    {supplyTypesLabel(item.supply_types)}
                </p>
                <p>
                    <strong>Тип файла:</strong>{' '}
                    {getInvoiceTemplateTypeLabel(item.type)}
                </p>
                <p>
                    <strong>Описание:</strong> {item.description || '—'}
                </p>
                <p>
                    <strong>Активен:</strong> {item.is_active ? 'Да' : 'Нет'}
                </p>
                <p>
                    <strong>По умолчанию:</strong>{' '}
                    {item.is_default ? 'Да' : 'Нет'}
                </p>
                <p>
                    <strong>В архиве:</strong> {item.is_archived ? 'Да' : 'Нет'}
                </p>
                <p>
                    <strong>Счётчик использований:</strong> {item.counter}
                </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {onDownload && (
                    <Button variant="outline" onClick={onDownload}>
                        Скачать файл
                    </Button>
                )}
                {onToggleActive && (
                    <Button variant="outline" onClick={onToggleActive}>
                        {item.is_active ? 'Деактивировать' : 'Активировать'}
                    </Button>
                )}
                {onSetDefault && !item.is_default && (
                    <Button variant="outline" onClick={onSetDefault}>
                        Сделать основным
                    </Button>
                )}
                {onArchive && !item.is_archived && (
                    <Button variant="outline" onClick={onArchive}>
                        В архив
                    </Button>
                )}
                {onUnarchive && item.is_archived && (
                    <Button variant="outline" onClick={onUnarchive}>
                        Из архива
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
