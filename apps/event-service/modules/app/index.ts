// ВАЖНО: барель не реэкспортирует стор — он тянет за собой rootReducer и
// половину приложения, замыкая цикл инициализации. Прямой путь:
// '@/modules/app/model/store'.
export * from './model/thunk/AppThunk';
export * from './lib/hooks/redux';
export * from './model/slice/AppSlice';
export * from './model/thunk/AppThunk';

export * from './lib/hooks/useIsClient';
export * from './ui/App';
