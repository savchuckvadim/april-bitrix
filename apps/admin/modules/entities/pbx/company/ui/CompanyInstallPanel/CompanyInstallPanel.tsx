'use client';

import { PbxFieldsManager } from '../../../fields';
import { companyFieldsAdapter } from '../../lib/api/company-fields-api';

export function CompanyInstallPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={companyFieldsAdapter} />;
}
