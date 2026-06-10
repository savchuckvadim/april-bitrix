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
import { IWordTemplate } from '../../model';

interface WordTemplateCardProps {
    item: IWordTemplate;
    onDownload?: () => void;
    onSetActive?: () => void;
    onSetDefault?: () => void;
    onDelete?: () => void;
}

export function WordTemplateCard({
    item,
    onDownload,
    onSetActive,
    onSetDefault,
    onDelete,
}: WordTemplateCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Видимость:</strong> {item.visibility}</p>
                <p><strong>Код:</strong> {item.code}</p>
                <p><strong>Тип:</strong> {item.type}</p>
                <p><strong>Активен:</strong> {item.is_active ? 'Да' : 'Нет'}</p>
                <p><strong>По умолчанию:</strong> {item.is_default ? 'Да' : 'Нет'}</p>
                <p><strong>Теги:</strong> {item.tags || '—'}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
                {onDownload && (
                    <Button variant="outline" onClick={onDownload}>
                        Скачать DOCX
                    </Button>
                )}
                {onSetActive && (
                    <Button variant="outline" onClick={onSetActive}>
                        {item.is_active ? 'Деактивировать' : 'Активировать'}
                    </Button>
                )}
                {onSetDefault && (
                    <Button variant="outline" onClick={onSetDefault}>
                        Сделать default
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
