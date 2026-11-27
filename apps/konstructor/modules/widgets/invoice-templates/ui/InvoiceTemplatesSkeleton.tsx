/** Заглушка таблицы на первой загрузке списка. */
export const InvoiceTemplatesSkeleton = () => (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Загрузка шаблонов">
        {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
    </div>
);
