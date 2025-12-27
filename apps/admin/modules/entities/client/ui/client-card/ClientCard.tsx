'use client';

import * as React from 'react';
import { ClientResponseDto } from '@workspace/nest-api';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ClientCardProps {
    client: ClientResponseDto;
    onEdit?: () => void;
    onDelete?: () => void;
    onViewDetails?: () => void;
}

export function ClientCard({
    client,
    onEdit,
    onDelete,
    onViewDetails,
}: ClientCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl">{client.name}</CardTitle>
                        <CardDescription className="mt-1">
                            {client.email || 'Email не указан'}
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Badge
                            variant={
                                client.is_active ? 'default' : 'secondary'
                            }
                        >
                            {client.is_active ? 'Активен' : 'Неактивен'}
                        </Badge>
                        {client.status && (
                            <Badge variant="outline">{client.status}</Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-medium">{client.id}</span>
                    </div>
                    {client.created_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Создан:
                            </span>
                            <span className="font-medium">
                                {format(
                                    new Date(client.created_at),
                                    'dd.MM.yyyy HH:mm',
                                    { locale: ru },
                                )}
                            </span>
                        </div>
                    )}
                    {client.updated_at && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">
                                Обновлен:
                            </span>
                            <span className="font-medium">
                                {format(
                                    new Date(client.updated_at),
                                    'dd.MM.yyyy HH:mm',
                                    { locale: ru },
                                )}
                            </span>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex gap-2">
                {onViewDetails && (
                    <Button variant="outline" onClick={onViewDetails} className="flex-1">
                        Подробнее
                    </Button>
                )}
                {onEdit && (
                    <Button variant="outline" onClick={onEdit} className="flex-1">
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

