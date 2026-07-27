'use client';

import { useParams } from 'next/navigation';
import { ShareReportPage } from '@/modules/widgets/share-report';

/** Публичная страница отчёта по токену ссылки (без авторизации). */
export default function SharePage() {
    const params = useParams<{ token: string }>();
    const token = params?.token ?? '';
    if (!token) return null;
    return <ShareReportPage token={token} />;
}
