// ВАЖНО: этот барель НЕ должен реэкспортировать сам стор (`./model/store`)
// и провайдеры, которые его импортируют.
//
// `store.ts` на верхнем уровне собирает rootReducer и вызывает
// `startStoreListeners`, а слушатели, в свою очередь, тянут `appActions`.
// Пока `store` был в бареле, webpack исполнял его как side-effect ДО того,
// как барель успевал присвоить неймспейс `AppSlice`, — и любой вход в граф
// через барель (публичная /share, где нет App-инициализации) падал с
// `Cannot read properties of undefined`. Стор импортируется прямым путём:
// `@/modules/app/model/store`.

//reducer
export { appReducer, appActions } from './model/AppSlice';

//thunk
export { initial } from './model/AppThunk';

//hooks
export { useApp } from './lib/hooks/useApp';
export { useAppDispatch, useAppSelector } from './lib/hooks/redux';

// identity (viewAs-aware)
export {
    selectRealUser,
    selectEffectiveUser,
    selectIsViewAs,
    selectIsPublic,
} from './model/selectors';

// централизованный доступ (правила — modules/shared/access)
export {
    useAccess,
    useAccessContext,
    selectAccessContext,
} from './lib/access/use-access';
