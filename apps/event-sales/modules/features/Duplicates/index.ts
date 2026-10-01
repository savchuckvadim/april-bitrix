// Публичная поверхность слайса — только то, что реально потребляется снаружи:
// reducer в store, listener автопоиска в start-store-listeners, панель в EventItem
// (её монтируют через next/dynamic по прямому пути, поэтому здесь только тип).
export { duplicatesReducer, duplicatesActions } from './model/DuplicatesSlice';
export { startDuplicatesAppListener } from './model/DuplicatesAppListener';
// «Объединить карточки» — отдельный слайс окна кандидата.
export { mergeCardsReducer } from './model/MergeCardsSlice';
// Перезапуск поиска — действие предупреждения в шапке карточки.
export {
    searchDuplicates,
    deepSearchDuplicates,
} from './model/DuplicatesThunk';
