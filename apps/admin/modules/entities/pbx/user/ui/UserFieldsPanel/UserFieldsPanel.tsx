'use client';

import { PbxFieldsManager } from '../../../fields';
import { userFieldsAdapter } from '../../lib/api/user-fields-api';

export function UserFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={userFieldsAdapter} />;
}
