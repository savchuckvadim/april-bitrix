import { PbxGetCategoriesByEntityDto } from '@/modules/entities/portal-bitrix/btx-categories';
import { BtxCategoryList } from '@/modules/entities/portal-bitrix/btx-categories/features/btxCategories-list';

export default function BtxCategoriesPage() {
    return <BtxCategoryList params={{
        entityType: 'deal',
        entityId: 1,
    } as PbxGetCategoriesByEntityDto} />;
}
