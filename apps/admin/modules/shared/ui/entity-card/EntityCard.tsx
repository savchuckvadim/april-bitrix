'use client';

import * as React from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';

/**
 * Конфигурация полей для EntityCard
 */
export interface EntityFieldConfig<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, entity: T) => React.ReactNode;
    badge?: boolean;
    className?: string;
}

/**
 * Пропсы для EntityCard
 */
export interface EntityCardProps<T extends Record<string, any>> {
    entity: T;
    title: string | ((entity: T) => string);
    description?: string | ((entity: T) => string);
    fields: EntityFieldConfig<T>[];
    onEdit?: (entity: T) => void;
    onDelete?: (entity: T) => void;
    onView?: (entity: T) => void;
    className?: string;
}

/**
 * Универсальная карточка для отображения сущности
 * Принимает конфигурацию полей и автоматически рендерит карточку
 */
export function EntityCard<T extends Record<string, any>>({
    entity,
    title,
    description,
    fields,
    onEdit,
    onDelete,
    onView,
    className,
}: EntityCardProps<T>) {
    const titleText = typeof title === 'function' ? title(entity) : title;
    const descriptionText =
        typeof description === 'function' ? description(entity) : description;

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{titleText}</CardTitle>
                {descriptionText && (
                    <CardDescription>{descriptionText}</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {fields.map((field) => {
                        const value = entity[field.key];
                        const content = field.render
                            ? field.render(value, entity)
                            : String(value ?? '—');

                        return (
                            <div
                                key={String(field.key)}
                                className={field.className}
                            >
                                <div className="text-sm font-medium text-muted-foreground">
                                    {field.label}
                                </div>
                                <div className="mt-1">
                                    {field.badge ? (
                                        <Badge variant="secondary">
                                            {content}
                                        </Badge>
                                    ) : (
                                        <div className="text-sm">{content}</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
            {(onEdit || onDelete || onView) && (
                <CardFooter className="flex justify-end gap-2">
                    {onView && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onView(entity)}
                        >
                            Просмотр
                        </Button>
                    )}
                    {onEdit && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(entity)}
                        >
                            Редактировать
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => onDelete(entity)}
                        >
                            Удалить
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    );
}

