'use client';

import { useParams } from 'next/navigation';
import { DbSmartDetailScreen } from '@/modules/entities/pbx/smart';

export default function PbxDbSmartDetailPage() {
    const params = useParams<{ portalId: string; smartId: string }>();
    return (
        <DbSmartDetailScreen
            portalId={Number(params.portalId)}
            smartId={Number(params.smartId)}
        />
    );
}
