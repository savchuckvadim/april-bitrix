import { APRIL_BOOT_LOGO_SVG } from './boot-logo';

export const BOOT_PRELOADER_ID = 'boot-preloader';

/** Класс, которым приложение прячет boot-прелоадер после гидратации. */
export const BOOT_PRELOADER_HIDE_CLASS = 'boot-preloader--hide';

export interface BootPreloaderProps {
    /** Подпись под знаком. */
    title?: string;
    /**
     * Фирменный знак внутри кольца. `false` — только кольцо, строка — своя
     * SVG-разметка. Именно разметка, а не URL: ссылка на файл стоит лишнего
     * раунд-трипа и обесценивает весь приём.
     */
    logo?: boolean | string;
}

/**
 * Мгновенный boot-прелоадер: чистый HTML+CSS без ассетов и JS — приходит
 * в первом HTML-чанке (SSR) и виден ещё ДО загрузки бандлов. Скрывается
 * добавлением BOOT_PRELOADER_HIDE_CLASS — из BootPreloaderGate или из
 * собственного App-гейта приложения.
 *
 * Ни одного внешнего ресурса: знак вшит разметкой, стили инлайновые, шрифт
 * системный. Ничего из нарисованного здесь не ждёт ни CSS-бандла, ни
 * картинок, ни next/font — на момент показа они ещё не приехали.
 *
 * Цвета — токены темы с фолбэками: тема ставится ThemeInitScript'ом тоже
 * до гидратации, так что мигания не будет.
 *
 * Оправа (кольца, дыхание знака, бегущая полоска) намеренно повторяет
 * brand-вариант PreloaderScreen — см. PreloaderBrand.css. Приложения обычно
 * показывают их подряд (boot до гидратации, brand пока грузятся данные), и
 * при расхождении на стыке виден скачок. Правишь одно — синхронизируй второе.
 *
 * Рендерить в корневом layout ПЕРЕД контентом.
 */
export const BootPreloader = ({
    title = 'Апрель',
    logo = true,
}: BootPreloaderProps) => {
    const logoMarkup =
        logo === true ? APRIL_BOOT_LOGO_SVG : logo === false ? null : logo;

    return (
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
                gap: 1.5rem;
                background: var(--background, #fff);
                font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
                transition: opacity 0.35s ease;
            }
            #${BOOT_PRELOADER_ID}.${BOOT_PRELOADER_HIDE_CLASS} {
                opacity: 0;
                pointer-events: none;
            }
            #${BOOT_PRELOADER_ID} .boot-mark {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 112px;
                height: 112px;
            }
            #${BOOT_PRELOADER_ID} .boot-ring {
                position: absolute;
                inset: -14px;
                border-radius: 9999px;
                border: 1px solid transparent;
                border-top-color: var(--primary, #6366f1);
                border-right-color: color-mix(in oklab, var(--primary, #6366f1) 35%, transparent);
                animation: boot-preloader-spin 2.4s linear infinite;
            }
            #${BOOT_PRELOADER_ID} .boot-ring--outer {
                inset: -26px;
                border-top-color: color-mix(in oklab, var(--primary, #6366f1) 45%, transparent);
                border-right-color: transparent;
                animation-duration: 5s;
                animation-direction: reverse;
            }
            #${BOOT_PRELOADER_ID} .boot-logo {
                display: flex;
                width: 96px;
                height: 96px;
                color: var(--boot-logo-color, #aec3d6);
                animation: boot-preloader-breathe 2.8s ease-in-out infinite;
            }
            #${BOOT_PRELOADER_ID} .boot-logo svg {
                width: 100%;
                height: 100%;
            }
            #${BOOT_PRELOADER_ID} .boot-title {
                font-size: 0.875rem;
                font-weight: 600;
                letter-spacing: 0.35em;
                text-transform: uppercase;
                color: var(--muted-foreground, #6b7280);
            }
            #${BOOT_PRELOADER_ID} .boot-bar {
                position: relative;
                overflow: hidden;
                height: 2px;
                width: 10rem;
                border-radius: 9999px;
                background: color-mix(in oklab, var(--border, #e5e7eb) 60%, transparent);
            }
            #${BOOT_PRELOADER_ID} .boot-bar::after {
                content: '';
                position: absolute;
                inset-block: 0;
                left: 0;
                width: 40%;
                border-radius: 9999px;
                background: var(--primary, #6366f1);
                animation: boot-preloader-bar-slide 1.4s ease-in-out infinite;
            }
            @keyframes boot-preloader-spin {
                to { transform: rotate(360deg); }
            }
            @keyframes boot-preloader-breathe {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.04); opacity: 0.92; }
            }
            @keyframes boot-preloader-bar-slide {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(250%); }
            }
            @media (prefers-reduced-motion: reduce) {
                #${BOOT_PRELOADER_ID} .boot-ring,
                #${BOOT_PRELOADER_ID} .boot-logo,
                #${BOOT_PRELOADER_ID} .boot-bar::after { animation: none; }
            }
        `}</style>
            <div className="boot-mark">
                <span className="boot-ring boot-ring--outer" />
                <span className="boot-ring" />
                {logoMarkup && (
                    <span
                        className="boot-logo"
                        dangerouslySetInnerHTML={{ __html: logoMarkup }}
                    />
                )}
            </div>
            <div className="boot-title">{title}</div>
            <div className="boot-bar" />
        </div>
    );
};
