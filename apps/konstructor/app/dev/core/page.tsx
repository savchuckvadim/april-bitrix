'use client';

import dynamic from 'next/dynamic';

/** Dev-витрина ядра конструктора: тяжёлый виджет — только на клиенте, lazy */
const DevCoreWidget = dynamic(
    () => import('@/modules/widgets/dev-core').then(mod => mod.DevCoreWidget),
    { ssr: false, loading: () => <div className="p-4">Загрузка ядра…</div> },
);

export default function DevCorePage() {
    return <DevCoreWidget />;
}
