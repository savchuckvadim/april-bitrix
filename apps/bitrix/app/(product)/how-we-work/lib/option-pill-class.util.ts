/** Классы кнопки-варианта анкеты по её состоянию. */
export const optionPillClass = (
    selected: boolean,
    recommended: boolean,
): string => {
    const base =
        'cursor-pointer rounded-full border px-4 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-primary';
    if (selected) {
        return `${base} border-primary bg-primary/10 font-semibold text-primary`;
    }
    if (recommended) {
        return `${base} border-success/60 text-success hover:border-success`;
    }
    return `${base} text-muted-foreground hover:border-primary hover:text-primary`;
};
