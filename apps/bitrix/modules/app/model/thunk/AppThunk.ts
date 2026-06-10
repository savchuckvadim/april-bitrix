import { authActions } from '@/modules/processes/auth';
import { TESTING_DOMAIN, TESTING_USER } from '../../consts/app-global';
import { appActions } from '../slice/AppSlice';
import type { AppDispatch, AppGetState } from '../store';
import { Bitrix } from '@workspace/bitrix';
import { AuthHelper } from '@/modules/processes/auth/lib/auth.helper';
import type { ClientDto, UserResponseDto } from '@workspace/nest-api';

export const initializeApp =
    (isInstall: boolean | undefined = false) =>
    async (dispatch: AppDispatch, getState: AppGetState) => {
        const state = getState();
        if (state.app.isLoading) return;

        dispatch(appActions.isLoading({ status: true }));

        if (isInstall) {
            dispatch(appActions.setInitializedSuccess({}));
            dispatch(appActions.isLoading({ status: false }));
            return;
        }

        try {
            const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
            const { inFrame, domain, user: bitrixUser } = bitrix.api.getInitializedData();
            const place = inFrame ? 'frame' : 'standalone';

            dispatch(appActions.setClientContext({ isClient: inFrame, domain, place }));

            let user: UserResponseDto | null = null;
            let client: ClientDto | null = null;

            if (inFrame) {
                user = (bitrixUser as UserResponseDto) ?? null;
            } else {
                try {
                    const auth = new AuthHelper();
                    const response = await auth.me();
                    user = response.user;
                    client = response.client;
                } catch {
                    // Auth interceptor handles 401 → refresh → retry automatically.
                    // If we still fail here, user is truly unauthenticated.
                    user = null;
                }
            }

            dispatch(authActions.setCurrentUser({ currentUser: user, currentClient: client }));
        } catch (err) {
            console.error('App init failed', err);
            dispatch(authActions.setCurrentUser(null));
        } finally {
            dispatch(appActions.setInitializedSuccess({}));
            dispatch(appActions.isLoading({ status: false }));
        }
    };

export const reloadApp = () => async (_dispatch: AppDispatch, _getState: AppGetState) => {
    // TODO: implement app reload logic
};
