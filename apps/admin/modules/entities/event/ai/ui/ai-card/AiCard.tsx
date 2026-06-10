'use client';

import * as React from 'react';
import { ACard } from '@workspace/ui/shared';
import { AiEntity } from '../../model';
import { Badge } from '@workspace/ui/components/badge';
import { ScrollContentWrapper } from '@/modules/shared';

interface AiCardProps {
    item: AiEntity;
}

export function AiCard({ item }: AiCardProps) {
    return (
        <ScrollContentWrapper>
            <ACard
                title={`AI запись #${item.id}`}
                description={`Домен: ${item.domain || '—'} | Пользователь: ${item.user_name || item.user_id || '—'}`}
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
                            <p className="font-medium">{item.user_name || item.user_id || '—'}</p>
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
                            <Badge variant={item.in_comment ? 'default' : 'outline'} className="mt-1">
                                {item.in_comment ? 'Да' : 'Нет'}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">В отчете:</span>
                            <Badge variant={item.in_report ? 'default' : 'outline'} className="mt-1">
                                {item.in_report ? 'Да' : 'Нет'}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Тип сущности:</span>
                            <p className="font-medium">{item.entity_type || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Название сущности:</span>
                            <p className="font-medium">{item.entity_name || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">ID сущности:</span>
                            <p className="font-medium">{item.entity_id || '—'}</p>
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
                            <span className="text-sm text-muted-foreground">Тип:</span>
                            <Badge variant="outline" className="mt-1">
                                {item.type || '—'}
                            </Badge>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Модель:</span>
                            <p className="font-medium">{item.model || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Activity ID:</span>
                            <p className="font-medium">{item.activity_id || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">File ID:</span>
                            <p className="font-medium">{item.file_id || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Report Item ID:</span>
                            <p className="font-medium">{item.report_item_id || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Portal ID:</span>
                            <p className="font-medium">{item.portal_id || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Transcription ID:</span>
                            <p className="font-medium">{item.transcription_id || '—'}</p>
                        </div>
                    </div>

                    {/* Метрики */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                        <div>
                            <span className="text-sm text-muted-foreground">Токенов:</span>
                            <p className="font-medium">{item.tokens_count || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Символов:</span>
                            <p className="font-medium">{item.symbols_count || '—'}</p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Цена:</span>
                            <p className="font-medium">{item.price || '—'}</p>
                        </div>
                    </div>

                    {/* Результат */}
                    <div className="pt-4 border-t">
                        <span className="text-sm text-muted-foreground block mb-2">Результат:</span>
                        <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.result || 'Результат отсутствует'}</p>
                        </div>
                    </div>

                    {/* Дополнительные результаты */}
                    {(item.report_result || item.user_comment || item.owner_comment) && (
                        <div className="pt-4 border-t space-y-4">
                            {item.report_result && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Результат отчета:</span>
                                    <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <p className="whitespace-pre-wrap text-sm">{item.report_result}</p>
                                    </div>
                                </div>
                            )}
                            {item.user_comment && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Комментарий пользователя:</span>
                                    <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <p className="whitespace-pre-wrap text-sm">{item.user_comment}</p>
                                    </div>
                                </div>
                            )}
                            {item.owner_comment && (
                                <div>
                                    <span className="text-sm text-muted-foreground block mb-2">Комментарий владельца:</span>
                                    <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                                        <p className="whitespace-pre-wrap text-sm">{item.owner_comment}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Оценки */}
                    {(item.user_mark || item.owner_mark) && (
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <span className="text-sm text-muted-foreground">Оценка пользователя:</span>
                                <p className="font-medium">{item.user_mark || '—'}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Оценка владельца:</span>
                                <p className="font-medium">{item.owner_mark || '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* Даты */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                            <span className="text-sm text-muted-foreground">Создано:</span>
                            <p className="font-medium">
                                {item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '—'}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Обновлено:</span>
                            <p className="font-medium">
                                {item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : '—'}
                            </p>
                        </div>
                    </div>
                </div>
            </ACard>
        </ScrollContentWrapper>
    );
}
