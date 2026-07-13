'use client';

import { useParams } from 'next/navigation';
import { MeasureDetail } from '@/modules/entities/konstructor/measure';

export default function KonstructorMeasureDetailPage() {
    const params = useParams<{ id: string }>();
    return <MeasureDetail id={Number(params.id)} />;
}
