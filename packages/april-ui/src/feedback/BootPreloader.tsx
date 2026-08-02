export const BOOT_PRELOADER_ID = 'boot-preloader';

/** Класс, которым приложение прячет boot-прелоадер после гидратации. */
export const BOOT_PRELOADER_HIDE_CLASS = 'boot-preloader--hide';

export interface BootPreloaderProps {
    /** Подпись под кольцом. */
    title?: string;
}

/**
 * Мгновенный boot-прелоадер: чистый HTML+CSS без ассетов и JS — приходит
 * в первом HTML-чанке (SSR) и виден ещё ДО загрузки бандлов. Скрывается
 * из App первым клиентским эффектом добавлением BOOT_PRELOADER_HIDE_CLASS.
 *
 * Цвета — токены темы с фолбэками: тема ставится ThemeInitScript'ом тоже
 * до гидратации, так что мигания не будет. Стили инлайновые намеренно —
 * внешний CSS к этому моменту ещё не приехал.
 *
 * Рендерить в корневом layout ПЕРЕД контентом.
 */
export const BootPreloader = ({ title = 'Апрель' }: BootPreloaderProps) => (
    <div id={BOOT_PRELOADER_ID}>
        <style>{`
            #${BOOT_PRELOADER_ID} {
                position: fixed;
                inset: 0;
                z-index: 100;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1.25rem;
                background: var(--background, #fff);
                transition: opacity 0.35s ease;
            }
            #${BOOT_PRELOADER_ID}.${BOOT_PRELOADER_HIDE_CLASS} {
                opacity: 0;
                pointer-events: none;
            }
            #${BOOT_PRELOADER_ID} .boot-ring {
                width: 56px;
                height: 56px;
                border-radius: 9999px;
                border: 2px solid color-mix(in oklab, var(--primary, #6366f1) 25%, transparent);
                border-top-color: var(--primary, #6366f1);
                animation: boot-preloader-spin 0.9s linear infinite;
            }
            #${BOOT_PRELOADER_ID} .boot-title {
                font-size: 0.8rem;
                font-weight: 600;
                letter-spacing: 0.35em;
                text-transform: uppercase;
                color: var(--muted-foreground, #6b7280);
            }
            @keyframes boot-preloader-spin {
                to { transform: rotate(360deg); }
            }
            @media (prefers-reduced-motion: reduce) {
                #${BOOT_PRELOADER_ID} .boot-ring { animation: none; }
            }
        `}</style>
        <div className="boot-ring" />
        <div className="boot-title">{title}</div>
    </div>
);
