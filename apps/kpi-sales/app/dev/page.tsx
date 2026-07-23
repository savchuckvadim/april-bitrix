'use client';

import dynamic from 'next/dynamic';
import { Processing } from '@/modules/shared';

// Dev-дубль страницы отчёта (для локальных проверок вне /report).
const Report = dynamic(() => import('@/modules/widgets/report/ui/Report'), {
    ssr: false,
    loading: () => <Processing />,
});

export default function DevReportPage() {
    return <Report />;
}
