
import { authActions } from '../model';
import { loginThunk, registerClientThunk, registerUserThunk, logoutThunk } from '../model/thunk/AuthThunk';
import { IRegisterForm } from '../model/types';
import { useAppDispatch, useAppSelector } from '@/modules/app';
import { ILoginForm } from '../model/types';

export const useAuth = () => {
    const dispatch = useAppDispatch();
    const auth = useAppSelector((state) => state.auth);
debugger
    const login = (form: ILoginForm) => dispatch(loginThunk(form));
    const registerClient = (form: IRegisterForm) => dispatch(registerClientThunk(form));
    const registerUser = (form: IRegisterForm) => dispatch(registerUserThunk(form));
    const logout = () => dispatch(logoutThunk());
    const clearError = () => dispatch(authActions.clearError());

    return {
        ...auth,
        login,
        registerClient,
        registerUser,
        logout,
        clearError,
    };
};
