'use client';

import dynamic from 'next/dynamic';
import { Processing } from '@/modules/shared';

// Страница читает стор приложения (портал, пользователь) — рисуем только в
// браузере, как отчёт; код раздела грузится отдельным куском.
const ReportSettingsPage = dynamic(
    () => import('@/modules/widgets/report-settings').then(m => m.ReportSettingsPage),
    {
        ssr: false,
        loading: () => <Processing />,
    },
);

/**
 * «Настройки отчёта»: отдельная страница приложения на всю ширину. Каркас
 * (layout) даёт ей инициализацию приложения и сессию портала, но не каркас
 * отчёта — см. modules/app/lib/layout/app-layout-kind.ts.
 */
export default function SettingsPage() {
    return <ReportSettingsPage />;
}
