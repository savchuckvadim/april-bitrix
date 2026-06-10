import { getApiErrorMessage } from '@workspace/nest-api';
import { AppThunk } from '../../../../app/model/store';
import { AuthHelper } from '../../lib/auth.helper';
import { authActions } from '../slice/AuthSlice';
import type { IRegisterForm, ILoginForm } from '../types';

export const loginThunk =
    (form: ILoginForm): AppThunk =>
        async (dispatch) => {

            dispatch(authActions.setLoading(true));
            dispatch(authActions.clearError());

            try {
                const api = new AuthHelper();
                const response = await api.login(form);

                if (response.client.id && response.user.id) {
                    dispatch(
                        authActions.loginSuccess({
                            currentUser: response.user,
                            currentClient: response.client,
                        }),
                    );
                    window.location.href = '/standalone';
                } else {
                    dispatch(authActions.loginFailure('Неверный email или пароль'));
                }
            } catch (error) {
                dispatch(authActions.loginFailure(getApiErrorMessage(error)));
            }
        };

export const registerClientThunk =
    (form: IRegisterForm): AppThunk =>
        async (dispatch) => {
            dispatch(authActions.setLoading(true));
            dispatch(authActions.clearError());
            try {
                if (form.password !== form.confirmPassword) {
                    dispatch(authActions.registerFailure('Пароли не совпадают'));
                    return;
                }

                const api = new AuthHelper();
                const response = await api.register(form);
                dispatch(
                    authActions.registerSuccess({
                        currentClient: response.client,
                        currentUser: response.owner,
                    }),
                );
                window.location.href = `/auth/confirm?email=${form.email}`;
            } catch (error) {
                dispatch(authActions.registerFailure(getApiErrorMessage(error)));
            }
        };

export const registerUserThunk =
    (_form: IRegisterForm): AppThunk =>
        async (dispatch) => {
            dispatch(authActions.setLoading(true));
            dispatch(authActions.clearError());
            // TODO: implement when backend supports user-only registration
            dispatch(authActions.setLoading(false));
        };

export const logoutThunk = (): AppThunk => async (dispatch) => {
    try {
        const api = new AuthHelper();
        await api.logout();
        dispatch(authActions.logout());
        window.location.href = '/auth/login';
    } catch (error) {
        dispatch(authActions.loginFailure(getApiErrorMessage(error)));
    }
};

