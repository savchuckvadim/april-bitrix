'use client';

import { PbxFieldsManager } from '../../../fields';
import { contactFieldsAdapter } from '../../lib/api/contact-fields-api';

export function ContactFieldsPanel({ portalId }: { portalId: number }) {
    return <PbxFieldsManager portalId={portalId} adapter={contactFieldsAdapter} />;
}
