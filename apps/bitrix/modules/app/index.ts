// ВАЖНО: барель не реэкспортирует AppProvider — тот импортирует `store`, а стор
// при инициализации собирает rootReducer и тянет за собой половину приложения.
// Пока провайдер был здесь, любой модуль, взявший из бареля хотя бы
// useAppSelector, запускал создание стора и замыкал цикл инициализации.
// Провайдер импортируется прямым путём: '@/modules/app/providers/AppProvider'.

export * from './lib/hooks/redux';
export * from './lib/hooks/app';
export * from './ui/App';
