import { BtxCategorieList } from '@/modules/entities/btx-categories/features/btxCategories-list';
import { BtxCategoryGetAllCategoriesParams } from '@workspace/nest-api';

export default function BtxCategoriesPage() {
    return <BtxCategorieList params={{
        entity_type: 'client',
        entity_id: '1',
        parent_type: 'client',
        parent_id: '1',
    } as BtxCategoryGetAllCategoriesParams} />;
}
