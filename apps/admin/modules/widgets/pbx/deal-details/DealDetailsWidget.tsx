'use client';

import { BtxDealResponseDto } from '@workspace/nest-api';
import { BtxDealCard } from '@/modules/entities/portal-bitrix/btx-deals/ui/btxDeals-card';
import { useBtxCategories } from '@/modules/entities/portal-bitrix/btx-categories/lib/hooks';
import { createDealFieldsContext, DealFieldsManager } from '@/modules/features/pbx/deal-fields';
import { EntityRelationsTabs, NestedEntitiesExplorer } from '@/modules/shared/ui';
import { PbxGetCategoriesByEntityDto } from '@/modules/entities/portal-bitrix/btx-categories';

interface DealDetailsWidgetProps {
    portalId: number;
    deal: BtxDealResponseDto;
    onEdit?: () => void;
    onBack?: () => void;
    categoriesEnabled?: boolean;
    onAddCategory?: () => void;
}

export function DealDetailsWidget({
    portalId,
    deal,
    onEdit,
    onBack,
    categoriesEnabled = true,
    onAddCategory,
}: DealDetailsWidgetProps) {
    const fieldsContext = createDealFieldsContext(portalId, deal.id);
    const { data: categories, isLoading: categoriesLoading } = useBtxCategories(
        {
            entityType: 'deal',
            entityId: Number(deal.id),
        } as PbxGetCategoriesByEntityDto

    );

    const categoriesList = Array.isArray(categories) ? categories : [];

    return (
        <div className="space-y-4 container mx-auto">
            <EntityRelationsTabs
                defaultTab="main"
                tabs={[
                    {
                        id: 'main',
                        label: 'Main info',
                        content: (
                            <BtxDealCard
                                item={deal}
                                onEdit={onEdit}
                                onViewDetails={onBack}
                            />
                        ),
                    },
                    {
                        id: 'fields',
                        label: 'Fields',
                        content: <DealFieldsManager context={fieldsContext} />,
                    },
                    {
                        id: 'categories',
                        label: 'Categories',
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
                ]}
            />
        </div>
    );
}

