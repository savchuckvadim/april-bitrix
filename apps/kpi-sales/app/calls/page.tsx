'use client';

import dynamic from 'next/dynamic';
import { Processing } from '@/modules/shared';

// Страница читает фильтры из адреса (useSearchParams) — рисуем только в
// браузере, как отчёт; код раздела грузится отдельным куском.
const CallsListPage = dynamic(
    () => import('@/modules/widgets/calls-list').then(m => m.CallsListPage),
    {
        ssr: false,
        loading: () => <Processing />,
    },
);

/**
 * «Разборы звонков»: отдельная страница приложения на всю ширину. Каркас
 * (layout) даёт ей инициализацию приложения и сессию портала, но не каркас
 * отчёта — см. modules/app/lib/layout/app-layout-kind.ts.
 */
export default function CallsPage() {
    return <CallsListPage />;
}
