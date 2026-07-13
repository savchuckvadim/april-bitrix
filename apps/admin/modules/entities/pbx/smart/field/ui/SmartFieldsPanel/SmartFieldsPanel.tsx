'use client';

import { PbxFieldsManager } from '../../../../fields';
import { smartFieldsAdapter } from '../../lib/api/smart-fields-api';

export function SmartFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={smartFieldsAdapter} />;
}
