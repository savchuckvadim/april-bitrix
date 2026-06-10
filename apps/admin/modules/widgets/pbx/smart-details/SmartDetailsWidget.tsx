'use client';

import { SmartResponseDto } from '@workspace/nest-api';
import { SmartCard } from '@/modules/entities/portal-bitrix/btx-smarts/ui/smarts-card';
import { useBtxCategories } from '@/modules/entities/portal-bitrix/btx-categories/lib/hooks';
import { createSmartFieldsContext, SmartFieldsManager } from '@/modules/features/pbx/smart-fields';
import { SmartPbxOverviewTab } from '@/modules/features/pbx/pbx-smart-install';
import { EntityRelationsTabs, NestedEntitiesExplorer } from '@/modules/shared/ui';
import { PbxGetCategoriesByEntityDto } from '@/modules/entities/portal-bitrix/btx-categories';

interface SmartDetailsWidgetProps {
    portalId: number;
    smart: SmartResponseDto;
    onEdit?: () => void;
    onBack?: () => void;
    categoriesEnabled?: boolean;
    onAddCategory?: () => void;
}

export function SmartDetailsWidget({
    portalId,
    smart,
    onEdit,
    onBack,
    categoriesEnabled = true,
    onAddCategory,
}: SmartDetailsWidgetProps) {
    const fieldsContext = createSmartFieldsContext(portalId, smart.id);

    const { data: categories, isLoading: categoriesLoading } = useBtxCategories(
        {
            entityType: 'smart',
            entityId: Number(smart.id),
        } as PbxGetCategoriesByEntityDto
    );

    const categoriesList = Array.isArray(categories) ? categories : [];

    /**
     * PBX install context for the current smart.
     * smartCode maps to smart.name — the stable internal code set at creation,
     * which corresponds to PbxSmartDefinitionDto.code in the template.
     */
    const pbxInstallContext = {
        portalId,
        group: smart.group,
        smartCode: smart.name,
        smartId: smart.id,
    };

    return (
        <div className="space-y-4 container mx-auto">
            <EntityRelationsTabs
                defaultTab="main"
                tabs={[
                    {
                        id: 'main',
                        label: 'Основное',
                        content: (
                            <SmartCard
                                item={smart}
                                onEdit={onEdit}
                                onViewDetails={onBack}
                            />
                        ),
                    },
                    {
                        id: 'fields',
                        label: 'Поля',
                        content: <SmartFieldsManager context={fieldsContext} />,
                    },
                    {
                        id: 'categories',
                        label: 'Категории',
                        badgeCount: categoriesList.length,
                        disabled: !categoriesEnabled,
                        content: categoriesLoading ? (
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <NestedEntitiesExplorer
                                rootLabel="Categories"
                                rootData={categoriesList as unknown as Record<string, unknown>[]}
                                emptyActionLabel="Добавить категорию"
                                onEmptyAction={onAddCategory}
                            />
                        ),
                    },
                    {
                        id: 'pbx-install',
                        label: 'PBX шаблон',
                        content: (
                            <SmartPbxOverviewTab context={pbxInstallContext} />
                        ),
                    },
                ]}
            />
        </div>
    );
}
