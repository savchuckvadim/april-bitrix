'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui/components/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NodeStatusBadge } from '../NodeStatusBadge';
import { MapFieldDialog } from '../SmartMappingDialog';
import { usePbxSmartInstallActions } from '../../lib/hooks/use-pbx-smart-install-actions';
import type {
    PbxFieldDiffNode,
    PbxFieldItemDiffNode,
    PbxSmartInstallContext,
    PbxSmartFieldTarget,
    PbxSmartFieldItemTarget,
} from '../../model/types';

// ---------------------------------------------------------------------------
// Field item row
// ---------------------------------------------------------------------------

interface FieldItemRowProps {
    item: PbxFieldItemDiffNode;
    context: PbxSmartInstallContext;
    fieldCode: string;
}

function FieldItemRow({ item, context, fieldCode }: FieldItemRowProps) {
    const { installNode } = usePbxSmartInstallActions();

    const target: PbxSmartFieldItemTarget = {
        scope: 'smart_field_item',
        portalId: context.portalId,
        group: context.group,
        smartCode: context.smartCode,
        fieldCode,
        itemCode: item.template.code,
    };

    return (
        <div className="flex items-center justify-between gap-2 py-2 pl-6 border-b last:border-b-0">
            <div className="flex items-center gap-2">
                <span className="text-sm">{item.template.value}</span>
                <NodeStatusBadge status={item.status} />
                <span className="text-xs text-muted-foreground">
                    {item.template.code}
                </span>
            </div>

            {item.status === 'missing' && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-xs"
                    disabled={installNode.isPending}
                    onClick={() => installNode.mutate(target)}
                >
                    Установить
                </Button>
            )}
        </div>
    );
}

// ---------------------------------------------------------------------------
// Field row (collapsible for enum items)
// ---------------------------------------------------------------------------

interface FieldRowProps {
    field: PbxFieldDiffNode;
    context: PbxSmartInstallContext;
    bitrixEntityTypeId: number | undefined;
}

function FieldRow({ field, context, bitrixEntityTypeId }: FieldRowProps) {
    const [open, setOpen] = React.useState(false);
    const [mapOpen, setMapOpen] = React.useState(false);
    const { installNode } = usePbxSmartInstallActions();

    const target: PbxSmartFieldTarget = {
        scope: 'smart_field',
        portalId: context.portalId,
        group: context.group,
        smartCode: context.smartCode,
        fieldCode: field.template.code,
    };

    const hasItems = field.items.length > 0;
    const missingItems = field.items.filter(
        (i) => i.status !== 'installed',
    ).length;

    return (
        <>
            <Collapsible open={open} onOpenChange={setOpen}>
                <div className="flex items-start justify-between gap-2 py-3 border-b last:border-b-0">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-left flex-1 min-w-0">
                            {hasItems ? (
                                open ? (
                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                                )
                            ) : (
                                <span className="w-4 h-4 shrink-0" />
                            )}
                            <span className="font-medium truncate">
                                {field.template.name}
                            </span>
                            <NodeStatusBadge status={field.status} />
                            <span className="text-xs text-muted-foreground">
                                {field.template.type}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {field.template.code}
                            </span>
                            {hasItems && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                    варианты: {field.items.length - missingItems}/
                                    {field.items.length}
                                </span>
                            )}
                        </button>
                    </CollapsibleTrigger>

                    <div className="flex gap-2 shrink-0">
                        {field.status === 'missing' && (
                            <>
                                <Button
                                    size="sm"
                                    disabled={installNode.isPending}
                                    onClick={() => installNode.mutate(target)}
                                >
                                    Установить
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setMapOpen(true)}
                                >
                                    Сопоставить
                                </Button>
                            </>
                        )}
                        {(field.status === 'mapped') && (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setMapOpen(true)}
                            >
                                Переназначить
                            </Button>
                        )}
                        {field.status === 'partial' && (
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={installNode.isPending}
                                onClick={() => installNode.mutate(target)}
                            >
                                Синхронизировать
                            </Button>
                        )}
                    </div>
                </div>

                {hasItems && (
                    <CollapsibleContent>
                        <div className="ml-4 border-l pl-2 mb-2">
                            {field.items.map((item) => (
                                <FieldItemRow
                                    key={item.template.code}
                                    item={item}
                                    context={context}
                                    fieldCode={field.template.code}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                )}
            </Collapsible>

            <MapFieldDialog
                open={mapOpen}
                onOpenChange={setMapOpen}
                context={context}
                fieldCode={field.template.code}
                fieldName={field.template.name}
                bitrixEntityTypeId={bitrixEntityTypeId}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

interface SmartFieldsInstallSectionProps {
    fields: PbxFieldDiffNode[];
    context: PbxSmartInstallContext;
    /** entityTypeId of the installed/mapped Bitrix smart — needed for MapFieldDialog */
    bitrixEntityTypeId?: number;
}

export function SmartFieldsInstallSection({
    fields,
    context,
    bitrixEntityTypeId,
}: SmartFieldsInstallSectionProps) {
    if (fields.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-2">
                Шаблон не содержит полей для этого смарта.
            </p>
        );
    }

    const missingCount = fields.filter((f) => f.status !== 'installed').length;

    return (
        <div className="space-y-1">
            {missingCount > 0 && (
                <p className="text-sm text-muted-foreground mb-3">
                    Не установлено: {missingCount} из {fields.length}
                </p>
            )}
            {fields.map((field) => (
                <FieldRow
                    key={field.template.code}
                    field={field}
                    context={context}
                    bitrixEntityTypeId={bitrixEntityTypeId}
                />
            ))}
        </div>
    );
}
