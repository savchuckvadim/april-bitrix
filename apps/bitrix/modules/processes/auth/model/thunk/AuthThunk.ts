import { AxiosError } from 'axios';
import { AppThunk } from '../../../../app/model/store';
import { authHelper } from '../../lib/auth.helper';
import { authActions } from '../slice/AuthSlice';
import { IRegisterForm, ILoginForm } from '../types';
import { IBackResponse } from '@workspace/nest-api';


export const loginThunk = (form: ILoginForm): AppThunk => async (dispatch) => {
    dispatch(authActions.setLoading(true));
    dispatch(authActions.clearError());

    try {
        // Имитация API вызова
        const response = await authHelper.login(form);

        if (response.client.id && response.user.id) {


            dispatch(authActions.loginSuccess({
                currentUser: response.user,
                currentClient: response.client,
            }));

        } else {
            dispatch(authActions.loginFailure('Неверный email или пароль'));
        }
    } catch (error) {
        dispatch(authActions.loginFailure('Ошибка входа в систему'));
    }
};

export const registerClientThunk = (form: IRegisterForm): AppThunk => async (dispatch) => {
    dispatch(authActions.setLoading(true));
    dispatch(authActions.clearError());

    try {
        if (form.password !== form.confirmPassword) {
            dispatch(authActions.registerFailure('Пароли не совпадают'));
            return;
        }

        // Имитация API вызова
        const response = await authHelper.register(form);


        dispatch(authActions.registerSuccess({
            currentClient: response.client,
            currentUser: response.owner,
        }));
    } catch (error: unknown) {
        const errorResponse = error as AxiosError<IBackResponse<null | string>>;
        const errorMessage = errorResponse.response?.data?.errors?.[0] || errorResponse.response?.data?.message || 'Ошибка регистрации';

        dispatch(authActions.registerFailure(errorMessage));
    }
};
export const registerUserThunk = (form: IRegisterForm): AppThunk => async (dispatch) => {
    dispatch(authActions.setLoading(true));
    dispatch(authActions.clearError());

    try {




    } catch (error) {
        dispatch(authActions.registerFailure('Ошибка регистрации'));
    }
};
export const logoutThunk = (): AppThunk => async (dispatch) => {
    dispatch(authActions.logout());
};
