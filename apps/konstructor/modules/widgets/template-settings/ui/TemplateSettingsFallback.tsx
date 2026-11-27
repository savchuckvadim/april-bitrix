/** Заглушка раздела, пока грузится его код. */
export const TemplateSettingsFallback = () => (
    <div
        className="mx-auto flex w-full flex-1 flex-col gap-3 px-4 py-6 lg:px-6"
        aria-busy="true"
        aria-label="Загрузка раздела"
    >
        {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
        ))}
    </div>
);
