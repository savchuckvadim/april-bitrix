'use client';

/** Быстрозагружаемый фон-заглушка: без WebGL, только токены темы. */
export const PreloaderMinimal = () => (
    <div className="absolute inset-0 bg-background">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
    </div>
);
