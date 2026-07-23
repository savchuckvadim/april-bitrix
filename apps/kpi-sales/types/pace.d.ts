// Глобальные декларации pace-js (прогресс-бар загрузки страницы).
// Ambient-файл (без import/export) — попадает в глобальную область типов.

declare module 'pace-js' {
    const pace: any;
    export default pace;
}

declare const Pace: {
    on: (event: string, callback: () => void) => void;
};

interface Window {
    Pace: {
        on: (event: string, callback: () => void) => void;
    };
}
