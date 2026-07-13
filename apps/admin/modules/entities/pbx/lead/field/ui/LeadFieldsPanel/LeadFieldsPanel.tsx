'use client';

import { PbxFieldsManager } from '../../../../fields';
import { leadFieldsAdapter } from '../../lib/api/lead-fields-api';

export function LeadFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={leadFieldsAdapter} />;
}
