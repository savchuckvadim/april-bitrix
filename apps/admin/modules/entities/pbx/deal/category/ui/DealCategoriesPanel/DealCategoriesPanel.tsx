'use client';

import { PbxCategoriesManager } from '../../../../categories';
import { dealCategoriesAdapter } from '../../lib/api/deal-categories-api';

export function DealCategoriesPanel({ portalId }: { portalId: number }) {
    return (
        <PbxCategoriesManager portalId={portalId} adapter={dealCategoriesAdapter} />
    );
}
