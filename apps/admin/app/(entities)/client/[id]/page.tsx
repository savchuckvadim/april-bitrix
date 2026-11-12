'use client';

import { use } from 'react';
import { ClientOverview } from '@/modules/widgets/client/client-overview';

/** Клиент (организация): что сделать, порталы с владельцами, люди. */
export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    return <ClientOverview clientId={Number.parseInt(id, 10)} />;
}
