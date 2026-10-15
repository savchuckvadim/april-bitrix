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
    formatCriteriaList,
    getClientTypeLabel,
    getSupplyTypeLabel,
} from '@/modules/entities/konstructor/lib';
import { getWordTemplateVisibilityLabel } from '../../consts/word-template.consts';
import { IWordTemplate, IWordTemplatePortalBinding } from '../../model';

interface WordTemplateCardProps {
    item: IWordTemplate;
    /** Привязки к порталам + подписи порталов (домен) по id. */
    bindings?: IWordTemplatePortalBinding[];
    portalLabelById?: Map<string, string>;
    onDownload?: () => void;
    onSetActive?: () => void;
    onSetDefault?: () => void;
    onArchive?: () => void;
    onUnarchive?: () => void;
    onDelete?: () => void;
}

export function WordTemplateCard({
    item,
    bindings,
    portalLabelById,
    onDownload,
    onSetActive,
    onSetDefault,
    onArchive,
    onUnarchive,
    onDelete,
}: WordTemplateCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {item.name}
                    {item.is_archived && (
                        <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                            архив
                        </span>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Видимость:</strong> {getWordTemplateVisibilityLabel(item.visibility)}</p>
                <p><strong>Код:</strong> {item.code}</p>
                <p><strong>Тип:</strong> {item.type}</p>
                <p><strong>Активен:</strong> {item.is_active ? 'Да' : 'Нет'}</p>
                <p><strong>По умолчанию:</strong> {item.is_default ? 'Да' : 'Нет'}</p>
                <p><strong>Теги:</strong> {item.tags || '—'}</p>
                {/* Критерии подбора: хранятся справочно, автоподбор КП по ним не идёт. */}
                <p><strong>Поставщик:</strong> {item.agent_id ?? 'Любой'}</p>
                <p>
                    <strong>Типы клиента:</strong>{' '}
                    {formatCriteriaList(item.client_types, getClientTypeLabel)}
                </p>
                <p>
                    <strong>Виды размещения:</strong>{' '}
                    {formatCriteriaList(item.supply_types, getSupplyTypeLabel)}
                </p>
                {bindings && (
                    <div>
                        <strong>Порталы:</strong>{' '}
                        {bindings.length === 0 ? (
                            <span className="text-muted-foreground">
                                {item.visibility === 'public'
                                    ? 'публичный — виден всем'
                                    : 'не подключён ни к одному порталу (сирота — его не видит никто)'}
                            </span>
                        ) : (
                            <ul className="mt-1 list-inside list-disc">
                                {bindings.map((binding) => (
                                    <li key={binding.id}>
                                        {portalLabelById?.get(binding.portal_id) ?? `Портал #${binding.portal_id}`}
                                        {' — '}
                                        {binding.is_active ? 'подключён' : 'отключён'}
                                        {binding.is_default ? ', по умолчанию портала' : ''}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
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
                        Сделать по умолчанию
                    </Button>
                )}
                {item.is_archived
                    ? onUnarchive && (
                          <Button variant="outline" onClick={onUnarchive}>
                              Вернуть из архива
                          </Button>
                      )
                    : onArchive && (
                          <Button variant="outline" onClick={onArchive}>
                              В архив
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
