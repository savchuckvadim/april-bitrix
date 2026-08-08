// ВАЖНО: барель не реэкспортирует стор.
//
// `store.ts` при инициализации собирает rootReducer и поднимает listeners, то
// есть тянет за собой половину приложения. Пока он экспортировался отсюда,
// webpack исполнял его как side-effect бареля раньше, чем барель успевал
// присвоить неймспейсы своих модулей, — и вход в граф с любой стороны падал с
// `Cannot read properties of undefined`. Стор импортируется прямым путём:
// '@/modules/app/model/store'.

export * from './lib/hooks/redux';
export * from './model/slice/AppSlice';
export * from './model/thunk/AppThunk';
export type * from './model/types';
export * from './lib/hooks/useIsClient';
export * from './ui/App';
