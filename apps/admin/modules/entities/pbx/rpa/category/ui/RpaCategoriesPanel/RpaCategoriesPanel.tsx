'use client';

import { PbxCategoriesManager } from '../../../../categories';
import { rpaCategoriesAdapter } from '../../lib/api/rpa-categories-api';

export function RpaCategoriesPanel({ portalId }: { portalId: number }) {
    return (
        <PbxCategoriesManager portalId={portalId} adapter={rpaCategoriesAdapter} />
    );
}
