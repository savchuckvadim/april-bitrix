'use client';

import * as React from 'react';
import { GetSupplyResponseDto } from '@workspace/nest-admin-api';
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
import {
    SUPPLY_FIELD_GROUPS,
    SUPPLY_TEMPLATE_HINTS,
    SUPPLY_TEXT_KEYS,
    countFilledTexts,
    type SupplyFieldInfo,
} from '../../model/supply-fields';

interface SuppliesCardProps {
    item: GetSupplyResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
    /** Полная карточка со всеми разделами (страница одной поставки) */
    detailed?: boolean;
}

const asText = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    return String(value);
};

/** Одно поле: длинные тексты — блоком, короткие — строкой */
function FieldRow({
    field,
    item,
}: {
    field: SupplyFieldInfo;
    item: GetSupplyResponseDto;
}) {
    const text = asText(item[field.key]);

    if (field.kind === 'long') {
        return (
            <div className="space-y-1">
                <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{field.label}</span>
                    {text === '' && (
                        <span className="text-xs text-muted-foreground">
                            не заполнено
                        </span>
                    )}
                </div>
                {field.hint && (
                    <p className="text-xs text-muted-foreground">
                        {field.hint}
                    </p>
                )}
                {text !== '' && (
                    <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-sm">
                        {text}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-baseline justify-between gap-2">
            <span className="text-sm text-muted-foreground">
                {field.label}
                {field.hint && (
                    <span
                        className="ml-1 cursor-help text-xs"
                        title={field.hint}
                    >
                        ?
                    </span>
                )}
            </span>
            <span className="text-sm font-medium">
                {text === '' ? '—' : text}
            </span>
        </div>
    );
}

export function SuppliesCard({
    item,
    onEdit,
    onDelete,
    onViewDetails,
    detailed = false,
}: SuppliesCardProps) {
    const groups = detailed
        ? SUPPLY_FIELD_GROUPS
        : SUPPLY_FIELD_GROUPS.filter(group => group.id === 'main');
    const filled = countFilledTexts(item);
    const total = SUPPLY_TEXT_KEYS.length;

    return (
        <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <CardTitle className="text-xl">
                            {item.name || `ID: ${item.id}`}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            {item.fullName || item.shortName}
                        </CardDescription>
                    </div>
                    <Badge
                        variant={
                            filled === 0
                                ? 'destructive'
                                : filled < total
                                  ? 'secondary'
                                  : 'default'
                        }
                    >
                        Тексты: {filled} из {total}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {groups.map(group => (
                    <div key={group.id} className="space-y-3">
                        {detailed && (
                            <div>
                                <h3 className="text-sm font-semibold">
                                    {group.title}
                                </h3>
                                {group.description && (
                                    <p className="text-xs text-muted-foreground">
                                        {group.description}
                                    </p>
                                )}
                            </div>
                        )}
                        <div className="space-y-2">
                            {group.fields.map(field => (
                                <FieldRow
                                    key={field.key}
                                    field={field}
                                    item={item}
                                />
                            ))}
                        </div>
                    </div>
                ))}
                {detailed && (
                    <div className="rounded-md border p-3">
                        <h3 className="text-sm font-semibold">
                            Подстановки в текстах
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Система подставит число доступов этой поставки.
                        </p>
                        <ul className="mt-2 space-y-1">
                            {SUPPLY_TEMPLATE_HINTS.map(hint => (
                                <li
                                    key={hint}
                                    className="text-xs text-muted-foreground"
                                >
                                    {hint}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button
                        variant="outline"
                        onClick={onViewDetails}
                        className="flex-1"
                    >
                        Подробнее
                    </Button>
                )}
                {onEdit && (
                    <Button
                        variant="outline"
                        onClick={onEdit}
                        className="flex-1"
                    >
                        Изменить
                    </Button>
                )}
                {onDelete && (
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        className="flex-1"
                    >
                        Удалить
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
