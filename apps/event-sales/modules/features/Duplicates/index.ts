// Публичная поверхность слайса — только то, что реально потребляется снаружи:
// reducer в store, listener автопоиска в start-store-listeners, панель в EventItem
// (её монтируют через next/dynamic по прямому пути, поэтому здесь только тип).
export { duplicatesReducer } from './model/DuplicatesSlice';
export { startDuplicatesAppListener } from './model/DuplicatesAppListener';
