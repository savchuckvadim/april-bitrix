//components
// export { AppLazyContainer as App } from './ui/AppLazyContainer';
export { App } from './ui/App';
//reducer
export { appReducer, appActions } from './model/AppSlice';

//thunk
export { initial } from './model/AppThunk';

// Барель не реэкспортирует стор: он тянет rootReducer и половину приложения,
// замыкая цикл инициализации. Прямой путь: '@/modules/app/model/store'.

//hooks
export { useApp } from './lib/hooks/useApp';
export { useAppDispatch, useAppSelector } from './lib/hooks/redux';
