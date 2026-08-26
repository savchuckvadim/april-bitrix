/**
 * id внутреннего скролл-контейнера приложения (App.tsx, не self-sized режим):
 * его мотает к началу переход между страницами (EventProcessInit) — Next при
 * router.push scrollTop вложенного контейнера сам не сбрасывает.
 */
export const APP_SCROLL_CONTAINER_ID = 'event-sales-scroll';
