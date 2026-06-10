'use client';

import * as React from 'react';
import { ACard } from '@workspace/ui/shared';
import { TranscriptionEntity } from '../../model';
import { Badge } from '@workspace/ui/components/badge';

interface TranscriptionCardProps {
    item: TranscriptionEntity;
}

export function TranscriptionCard({ item }: TranscriptionCardProps) {
    return (
        <ACard
            title={`Транскрипция #${item.id}`}
            description={`Домен: ${item.domain || '—'} | Пользователь: ${item.userName || item.userId || '—'}`}
        >
            <div className="space-y-4">
                {/* Основная информация */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-sm text-muted-foreground">ID:</span>
                        <p className="font-medium">{item.id}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Домен:</span>
                        <p className="font-medium">{item.domain || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Пользователь:</span>
                        <p className="font-medium">{item.userName || item.userId || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Провайдер:</span>
                        <p className="font-medium">{item.provider || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Статус:</span>
                        <Badge variant="outline" className="mt-1">
                            {item.status || '—'}
                        </Badge>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">В комментарии:</span>
                        <Badge variant={item.inComment ? 'default' : 'outline'} className="mt-1">
                            {item.inComment ? 'Да' : 'Нет'}
                        </Badge>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Тип сущности:</span>
                        <p className="font-medium">{item.entityType || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Название сущности:</span>
                        <p className="font-medium">{item.entityName || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">ID сущности:</span>
                        <p className="font-medium">{item.entityId || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Приложение:</span>
                        <p className="font-medium">{item.app || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Отдел:</span>
                        <p className="font-medium">{item.department || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Activity ID:</span>
                        <p className="font-medium">{item.activityId || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">File ID:</span>
                        <p className="font-medium">{item.fileId || '—'}</p>
                    </div>
                </div>

                {/* Метрики */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                        <span className="text-sm text-muted-foreground">Длительность:</span>
                        <p className="font-medium">{item.duration || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Символов:</span>
                        <p className="font-medium">{item.symbolsCount || '—'}</p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Цена:</span>
                        <p className="font-medium">{item.price || '—'}</p>
                    </div>
                </div>

                {/* Текст транскрипции */}
                <div className="pt-4 border-t">
                    <span className="text-sm text-muted-foreground block mb-2">Текст транскрипции:</span>
                    <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <p className="whitespace-pre-wrap text-sm">{item.text || 'Текст отсутствует'}</p>
                    </div>
                </div>

                {/* Даты */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <span className="text-sm text-muted-foreground">Создано:</span>
                        <p className="font-medium">
                            {item.created_at ? new Date(item.created_at).toLocaleString('ru-RU') : '—'}
                        </p>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground">Обновлено:</span>
                        <p className="font-medium">
                            {item.updated_at ? new Date(item.updated_at).toLocaleString('ru-RU') : '—'}
                        </p>
                    </div>
                </div>
            </div>
        </ACard>
    );
}
