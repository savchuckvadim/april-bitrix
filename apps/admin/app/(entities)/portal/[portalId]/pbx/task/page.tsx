'use client';

import { useParams } from 'next/navigation';
import { TaskFieldsPanel } from '@/modules/entities/pbx/task';

export default function PbxTaskPage() {
    const params = useParams<{ portalId: string }>();
    return <TaskFieldsPanel portalId={Number(params.portalId)} />;
}
