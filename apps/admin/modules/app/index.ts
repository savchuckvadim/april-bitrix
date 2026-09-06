// ВАЖНО: этот барель не должен вытягивать стор.
//
// AppProvider импортирует `store`, а тот при инициализации собирает
// rootReducer. Пока провайдер экспортировался отсюда, любой модуль, взявший из
// бареля хотя бы useAppSelector, тянул за собой создание стора — и на входе в
// граф через entities получался цикл: стор читал portalReducer, пока слайс ещё
// создавался, с падением `Cannot access 'a' before initialization`.
// Провайдер импортируется прямым путём: '@/modules/app/providers/AppProvider'.

export * from './lib/hooks/redux';
export * from './lib/hooks/app';
export * from './ui/App';
