'use client';

import { useParams } from 'next/navigation';
import { PortalAiSettingsPanel } from '@/modules/entities/portal/ai-settings';

export default function PortalAiSettingsPage() {
    const params = useParams<{ portalId: string }>();
    return <PortalAiSettingsPanel portalId={Number(params.portalId)} />;
}
