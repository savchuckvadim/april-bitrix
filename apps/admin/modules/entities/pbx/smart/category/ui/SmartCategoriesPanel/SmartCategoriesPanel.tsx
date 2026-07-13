'use client';

import { PbxCategoriesManager } from '../../../../categories';
import { smartCategoriesAdapter } from '../../lib/api/smart-categories-api';

export function SmartCategoriesPanel({ portalId }: { portalId: number }) {
    return (
        <PbxCategoriesManager portalId={portalId} adapter={smartCategoriesAdapter} />
    );
}
