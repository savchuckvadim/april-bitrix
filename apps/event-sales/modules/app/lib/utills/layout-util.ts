import { APP_DISPLAY_MODE } from '../../types/app/app-type';

/**
 * Режим вёрстки из placement:
 * - compact — карточка сущности / карточка звонка (мало высоты, iframe
 *   подгоняется fitWindow, борьба за каждую строку);
 * - full — timeline / task / public (полная высота + прокрутка).
 */
export type AppLayoutMode = 'compact' | 'full';

export const getLayoutMode = (display: APP_DISPLAY_MODE): AppLayoutMode =>
    display === APP_DISPLAY_MODE.ENTITY_CARD ||
    display === APP_DISPLAY_MODE.CALL_CARD
        ? 'compact'
        : 'full';
