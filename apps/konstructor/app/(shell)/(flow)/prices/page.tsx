'use client';

import dynamic from 'next/dynamic';
import { PriceTableSkeleton } from '@/modules/widgets/price-table';

const DealPriceTable = dynamic(
    () =>
        import('@/modules/widgets/deal-price-table').then(
            module => module.DealPriceTable,
        ),
    { ssr: false, loading: () => <PriceTableSkeleton /> },
);

export default function PricesPage() {
    return <DealPriceTable />;
}
