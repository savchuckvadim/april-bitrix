import { authActions } from "@/modules/processes/auth";
import {
    TESTING_DOMAIN,
    TESTING_PLACEMENT,
    TESTING_USER,
} from "../../consts/app-global";
import { appActions } from "../slice/AppSlice";
import { AppDispatch, AppGetState } from "../store";
import { Bitrix } from '@workspace/bitrix';
import { AuthHelper } from "@/modules/processes/auth/lib/auth.helper";
import { ClientDto, UserResponseDto } from "@workspace/nest-api";

// export const initial = () =>
//     async (dispatch: AppDispatch, getState: AppGetState) => {
//         // startListeners()
//         // __IN_BITRIX__ && (await bitrixAPI.getFit());



//         const state = getState();
//         const isLoading = state.app.isLoading;
//         console.log('app init thunk')

//         if (!isLoading) {
//             console.log('app initial')
//             const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
//             // await bitrix.api.getFit();
//             const { inFrame, domain, user } = bitrix.api.getInitializedData()


//             dispatch(appActions.isLoading({ status: true }))


//             dispatch(appActions.setInitializedSuccess({}));

//             dispatch(appActions.isLoading({ status: false }))
//         }
//     };

export const initializeApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {
    const state = getState();
    console.log('initializeApp');
    console.log(state);
    if (state.app.isLoading) return;

    dispatch(appActions.isLoading({ status: true }));

    try {
        console.log('1. Определяем контекст');
        // 1. Определяем контекст
        const bitrix = await Bitrix.start(TESTING_DOMAIN, TESTING_USER);
        console.log('bitrix');
        console.log(bitrix);
        const { inFrame, domain, user: bitrixUser } = bitrix.api.getInitializedData();
        console.log('bitrixUser');
        console.log(bitrixUser);
        console.log('inFrame');
        console.log(inFrame);
        console.log('domain');
        console.log(domain);
        const place = inFrame ? 'frame' : 'standalone';
        console.log('place');
        console.log(place);
        dispatch(appActions.setClientContext({ isClient: inFrame, domain, place }));

        // 2. Определяем пользователя
        let user: UserResponseDto | null = null;
        let client: ClientDto | null = null;
        if (inFrame) {

            //TODO: init for frame
            user = bitrixUser as UserResponseDto ?? null;
        } else {

            const auth = new AuthHelper();
            try {
                const response = await auth.me();
                user = response.user;
                client = response.client;

            } catch {
                try {

                    // await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
                    //     method: 'POST',
                    //     credentials: 'include',
                    // });
                    const response = await auth.me();
                    user = response.user;
                    client = response.client;

                } catch {
                    user = null;
                }
            }
        }

        // 3. Диспатчим пользователя
        dispatch(authActions.setCurrentUser({ currentUser: user, currentClient: client }));
    } catch (err) {

        console.error('App init failed', err);
        dispatch(authActions.setCurrentUser(null));
    } finally {

        dispatch(appActions.setInitializedSuccess({}));
        dispatch(appActions.isLoading({ status: false }));
    }
};

export const reloadApp = () => async (dispatch: AppDispatch, getState: AppGetState) => {

    // dispatch(
    //     preloaderActions
    //         .setPreloader({ status: true })
    // )

    // setTimeout(() => {

    //     dispatch(eventActions.setCurrentPage(
    //         { page: ROUTE_EVENT.LIST }
    //     ))
    //     dispatch(
    //         // initialEventApp()
    //         appActions.reload()
    //     )
    //     dispatch(
    //         preloaderActions
    //             .setPreloader({ status: false })
    //     )

    // }, 3200)

}
