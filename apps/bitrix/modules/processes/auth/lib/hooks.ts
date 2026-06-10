
import { authActions } from '../model';
import { loginThunk, registerClientThunk, registerUserThunk, logoutThunk } from '../model/thunk/AuthThunk';
import { IRegisterForm } from '../model/types';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { ILoginForm } from '../model/types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
    const portal = useAppSelector((state) => state.portal);
    const login = (form: ILoginForm) => dispatch(loginThunk(form));
    const registerClient = (form: IRegisterForm) => dispatch(registerClientThunk(form));
    const registerUser = (form: IRegisterForm) => dispatch(registerUserThunk(form));
    const logout = () => dispatch(logoutThunk());
    const clearError = () => dispatch(authActions.clearError());
    const selectedPortal = portal.selectedPortal;
    return {
        ...auth,
        selectedPortal,
        login,
        registerClient,
        registerUser,
        logout,
        clearError,
    };
};
