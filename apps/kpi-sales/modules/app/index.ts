//components
// export { AppLazyContainer as App } from './ui/AppLazyContainer';
export { Providers } from './model/Provider';
//reducer
export { appReducer, appActions } from './model/AppSlice';

//thunk
export { initial } from './model/AppThunk';

export { store } from './model/store';

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
