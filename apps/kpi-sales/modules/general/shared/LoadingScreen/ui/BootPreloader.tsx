/**
 * Мгновенный boot-прелоадер: чистый HTML+CSS без ассетов и JS —
 * приходит в первом HTML-чанке (SSR) и виден ещё ДО загрузки бандлов.
 * Скрывается из App.tsx (первый клиентский эффект) добавлением класса.
 * Цвета — токены темы с фолбэками (тема ставится ThemeInitScript'ом
 * тоже до гидрации, так что мигания не будет).
 */
export const BOOT_PRELOADER_ID = 'boot-preloader';

export const BootPreloader = () => (
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
            #${BOOT_PRELOADER_ID}.boot-preloader--hide {
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
        `}</style>
        <div className="boot-ring" />
        <div className="boot-title">Апрель</div>
    </div>
);
