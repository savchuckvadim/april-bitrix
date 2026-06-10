'use client';

import * as React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@workspace/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { NodeStatusBadge } from '../NodeStatusBadge';
import { MapCategoryDialog, MapStageDialog } from '../SmartMappingDialog';
import { usePbxSmartInstallActions } from '../../lib/hooks/use-pbx-smart-install-actions';
import { useSmartsFromBitrix } from '@/modules/entities/bitrix/smart';
import type {
    PbxCategoryDiffNode,
    PbxStageDiffNode,
    PbxSmartInstallContext,
    PbxSmartCategoryTarget,
    PbxSmartStageTarget,
} from '../../model/types';
import type { BxSmartFullType } from '@/modules/entities/bitrix/smart';

// ---------------------------------------------------------------------------
// Stage row
// ---------------------------------------------------------------------------

interface StageRowProps {
    stage: PbxStageDiffNode;
    context: PbxSmartInstallContext;
    categoryCode: string;
    bxStages: BxSmartFullType['categories'][number]['stages'];
}

function StageRow({ stage, context, categoryCode, bxStages }: StageRowProps) {
    const { installNode } = usePbxSmartInstallActions();
    const [mapOpen, setMapOpen] = React.useState(false);

    const installTarget: PbxSmartStageTarget = {
        scope: 'smart_stage',
        portalId: context.portalId,
        group: context.group,
        smartCode: context.smartCode,
        categoryCode,
        stageCode: stage.template.code,
    };

    return (
        <>
            <div className="flex items-center justify-between gap-2 py-2 pl-6 border-b last:border-b-0">
                <div className="flex items-center gap-2">
                    <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: stage.template.color || '#94a3b8' }}
                    />
                    <span className="text-sm">{stage.template.name}</span>
                    <NodeStatusBadge status={stage.status} />
                    <span className="text-xs text-muted-foreground">
                        {stage.template.code}
                    </span>
                </div>

                <div className="flex gap-1 shrink-0">
                    {stage.status === 'missing' && (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs"
                                disabled={installNode.isPending}
                                onClick={() => installNode.mutate(installTarget)}
                            >
                                Установить
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                                onClick={() => setMapOpen(true)}
                            >
                                Сопоставить
                            </Button>
                        </>
                    )}
                    {stage.status === 'mapped' && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 text-xs"
                            onClick={() => setMapOpen(true)}
                        >
                            Переназначить
                        </Button>
                    )}
                </div>
            </div>

            <MapStageDialog
                open={mapOpen}
                onOpenChange={setMapOpen}
                context={context}
                categoryCode={categoryCode}
                stageCode={stage.template.code}
                stageName={stage.template.name}
                bxStages={bxStages as any}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Category row (collapsible)
// ---------------------------------------------------------------------------

interface CategoryRowProps {
    category: PbxCategoryDiffNode;
    context: PbxSmartInstallContext;
    bxSmart: BxSmartFullType | undefined;
}

function CategoryRow({ category, context, bxSmart }: CategoryRowProps) {
    const [open, setOpen] = React.useState(false);
    const [mapOpen, setMapOpen] = React.useState(false);
    const { installNode } = usePbxSmartInstallActions();

    const installTarget: PbxSmartCategoryTarget = {
        scope: 'smart_category',
        portalId: context.portalId,
        group: context.group,
        smartCode: context.smartCode,
        categoryCode: category.template.code,
    };

    // Find matching Bitrix category to get its stages
    const bxCategory = bxSmart?.categories.find(
        (c) => String(c.id) === String((category.installed as any)?.bitrixId ?? ''),
    );
    const bxStages = bxCategory?.stages ?? [];

    const hasStages = category.stages.length > 0;
    const missingStages = category.stages.filter(
        (s) => s.status !== 'installed' && s.status !== 'mapped',
    ).length;

    return (
        <>
            <Collapsible open={open} onOpenChange={setOpen}>
                <div className="flex items-start justify-between gap-2 py-3 border-b last:border-b-0">
                    <CollapsibleTrigger asChild>
                        <button className="flex items-center gap-2 text-left flex-1 min-w-0">
                            {hasStages ? (
                                open ? (
                                    <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                                )
                            ) : (
                                <span className="w-4 h-4 shrink-0" />
                            )}
                            <span className="font-medium truncate">
                                {category.template.name}
                            </span>
                            <NodeStatusBadge status={category.status} />
                            <span className="text-xs text-muted-foreground truncate">
                                {category.template.code}
                            </span>
                            {hasStages && (
                                <span className="text-xs text-muted-foreground shrink-0">
                                    стадии: {category.stages.length - missingStages}/
                                    {category.stages.length}
                                </span>
                            )}
                        </button>
                    </CollapsibleTrigger>

                    <div className="flex gap-1 shrink-0">
                        {category.status === 'missing' && (
                            <>
                                <Button
                                    size="sm"
                                    disabled={installNode.isPending}
                                    onClick={() => installNode.mutate(installTarget)}
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
                        {category.status === 'mapped' && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setMapOpen(true)}
                            >
                                Переназначить
                            </Button>
                        )}
                    </div>
                </div>

                {hasStages && (
                    <CollapsibleContent>
                        <div className="ml-4 border-l pl-2 mb-2">
                            {category.stages.map((stage) => (
                                <StageRow
                                    key={stage.template.code}
                                    stage={stage}
                                    context={context}
                                    categoryCode={category.template.code}
                                    bxStages={bxStages}
                                />
                            ))}
                        </div>
                    </CollapsibleContent>
                )}
            </Collapsible>

            <MapCategoryDialog
                open={mapOpen}
                onOpenChange={setMapOpen}
                context={context}
                categoryCode={category.template.code}
                categoryName={category.template.name}
                bxSmart={bxSmart}
            />
        </>
    );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

interface SmartCategoriesInstallSectionProps {
    categories: PbxCategoryDiffNode[];
    context: PbxSmartInstallContext;
}

export function SmartCategoriesInstallSection({
    categories,
    context,
}: SmartCategoriesInstallSectionProps) {
    // Load live Bitrix smarts to power mapping dialogs
    const { smarts: bxSmarts } = useSmartsFromBitrix();

    // Find the Bitrix smart that matches the current installed smart's entityTypeId
    // (after install or mapping, installed.entityTypeId will be set)
    const bxSmart = bxSmarts.find(
        (s) => String(s.entityTypeId) === String(context.smartId ?? ''),
    );

    if (categories.length === 0) {
        return (
            <p className="text-sm text-muted-foreground py-2">
                Шаблон не содержит категорий для этого смарта.
            </p>
        );
    }

    const actionableCount = categories.filter(
        (c) => c.status !== 'installed',
    ).length;

    return (
        <div className="space-y-1">
            {actionableCount > 0 && (
                <p className="text-sm text-muted-foreground mb-3">
                    Требует внимания: {actionableCount} из {categories.length}
                </p>
            )}
            {categories.map((cat) => (
                <CategoryRow
                    key={cat.template.code}
                    category={cat}
                    context={context}
                    bxSmart={bxSmart}
                />
            ))}
        </div>
    );
}
