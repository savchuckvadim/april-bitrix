'use client';

/** Скелетон экрана товаров на время загрузки каталога/слепка */
export const PriceTableSkeleton = () => (
    <div className="flex flex-col gap-3 p-4">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
        <div className="h-32 animate-pulse rounded-lg bg-muted" />
    </div>
);
