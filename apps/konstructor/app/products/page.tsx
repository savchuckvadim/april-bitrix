'use client';

import dynamic from 'next/dynamic';
import { PriceTableSkeleton } from '@/modules/widgets/price-table';

const PriceTableWidget = dynamic(
    () =>
        import('@/modules/widgets/price-table').then(
            module => module.PriceTableWidget,
        ),
    { ssr: false, loading: () => <PriceTableSkeleton /> },
);

export default function ProductsPage() {
    return <PriceTableWidget />;
}
