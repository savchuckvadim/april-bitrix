'use client';

/** Карточка шаблона договора. Все словарные значения — русскими подписями. */
import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
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
    getContractLtypeLabel,
    getSupplyTypeLabel,
    getTemplateScopeLabel,
} from '@/modules/entities/konstructor/lib';
import type { IContractTemplate } from '../../model';
import { scopeOfTemplate } from '../../lib/utils';

interface ContractTemplateCardProps {
    item: IContractTemplate;
    onDownload?: () => void;
    onDownloadDemo?: () => void;
    onSetActive?: () => void;
    onSetDefault?: () => void;
    onToggleArchive?: () => void;
    onDelete?: () => void;
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex gap-2">
        <span className="min-w-[180px] font-medium">{label}:</span>
        <span>{value}</span>
    </div>
);

export function ContractTemplateCard({
    item,
    onDownload,
    onDownloadDemo,
    onSetActive,
    onSetDefault,
    onToggleArchive,
    onDelete,
}: ContractTemplateCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2">
                    {item.name}
                    <Badge variant={item.is_active ? 'default' : 'secondary'}>
                        {item.is_active ? 'Активен' : 'Выключен'}
                    </Badge>
                    {item.is_default && <Badge variant="outline">По умолчанию</Badge>}
                    {item.is_archived && <Badge variant="outline">В архиве</Badge>}
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2 text-sm">
                <Row label="ID" value={item.id} />
                <Row label="Код" value={item.code} />
                <Row label="Тип договора" value={getContractLtypeLabel(item.contract_type)} />
                {/* «Любой» — это NULL на бэкенде, то есть «подходит любому». */}
                <Row label="Типы клиента" value={formatCriteriaList(item.client_types, getClientTypeLabel)} />
                <Row label="Типы поставки" value={formatCriteriaList(item.supply_types, getSupplyTypeLabel)} />
                <Row label="Область" value={getTemplateScopeLabel(scopeOfTemplate(item))} />
                <Row label="Портал" value={item.portal_id ?? 'Общий (все порталы)'} />
                <Row label="Поставщик" value={item.agent_id ?? 'Любой'} />
                <Row label="Описание" value={item.description || '—'} />
                <Row
                    label="Создан"
                    value={
                        item.created_at
                            ? new Date(item.created_at).toLocaleString('ru-RU')
                            : '—'
                    }
                />
                <Row
                    label="Изменён"
                    value={
                        item.updated_at
                            ? new Date(item.updated_at).toLocaleString('ru-RU')
                            : '—'
                    }
                />
                {item.is_archived && (
                    <Row
                        label="В архиве с"
                        value={
                            item.archived_at
                                ? new Date(item.archived_at).toLocaleString('ru-RU')
                                : '—'
                        }
                    />
                )}
            </CardContent>

            <CardFooter className="flex flex-wrap gap-2">
                {onDownload && (
                    <Button variant="outline" onClick={onDownload}>
                        Скачать шаблон
                    </Button>
                )}
                {/* Кнопка демо есть только если демо-файл загружен. */}
                {onDownloadDemo && item.demo_url && (
                    <Button variant="outline" onClick={onDownloadDemo}>
                        Скачать пример
                    </Button>
                )}
                {onSetActive && (
                    <Button variant="outline" onClick={onSetActive}>
                        {item.is_active ? 'Выключить' : 'Включить'}
                    </Button>
                )}
                {onSetDefault && (
                    <Button variant="outline" disabled={item.is_archived} onClick={onSetDefault}>
                        {item.is_default ? 'Снять «по умолчанию»' : 'Сделать по умолчанию'}
                    </Button>
                )}
                {onToggleArchive && (
                    <Button variant="outline" onClick={onToggleArchive}>
                        {item.is_archived ? 'Вернуть из архива' : 'В архив'}
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
