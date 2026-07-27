'use client';

import dynamic from 'next/dynamic';
import { Processing } from '@/modules/shared';

// Тяжёлый отчёт (таблицы + chart-стек) грузим лениво, страница — лёгкий каркас.
const Report = dynamic(
    () =>
        import('@/modules/widgets/report/report-view').then(m => m.Report),
    {
        ssr: false,
        loading: () => <Processing />,
    },
);

export default function ReportPage() {
    return <Report />;
}
