'use client';

import { PbxFieldsManager } from '../../../../fields';
import { rpaFieldsAdapter } from '../../lib/api/rpa-fields-api';

export function RpaFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={rpaFieldsAdapter} />;
}
