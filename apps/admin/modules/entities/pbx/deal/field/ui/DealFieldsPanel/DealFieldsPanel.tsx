'use client';

import { PbxFieldsManager } from '../../../../fields';
import { dealFieldsAdapter } from '../../lib/api/deal-fields-api';

export function DealFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={dealFieldsAdapter} />;
}
