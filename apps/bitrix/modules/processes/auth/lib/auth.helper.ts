import { ClientRegistrationRequestDto, getAuth, LoginDto } from "@workspace/nest-api";

export const authHelper = {
    login: async (dto: LoginDto ) => {
        const api = getAuth()
        const response = await api.authLogin(dto);


        return {

            user: response.user,
            client: response.client,
        };
    },
    register: async (dto: ClientRegistrationRequestDto) => {
        const api = getAuth()
        const response = await api.authRegisterClient(dto);
        return response;
    },
    logout: async () => {
        const api = getAuth()
        const response = await api.authLogout();
        return response;
    },
    getCurrentUser: async (dto: LoginDto) => {
        const api = getAuth()
        const response = await api.authLogin(dto);
        return response;
    },
};
