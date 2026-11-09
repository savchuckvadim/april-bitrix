/** Мягкое свечение за первым экраном: только токены темы, без картинок. */
export function HeroGlow() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-48 left-1/2 h-96 w-[56rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -bottom-40 right-0 h-72 w-[32rem] rounded-full bg-chart-3/10 blur-3xl" />
        </div>
    );
}
