import { ClientRegistrationRequestDto, ClientAuthResponseDto, getAuth, LoginDto } from "@workspace/nest-api";

export class AuthHelper {

    private api: ReturnType<typeof getAuth>;

    constructor() {
        this.api = getAuth();
    }

    async login(dto: LoginDto) {
        const response = await this.api.authLogin(dto);


        return {

            user: response.user,
            client: response.client,
        };
    }
    async register(dto: ClientRegistrationRequestDto): Promise<ClientAuthResponseDto> {

        const response = await this.api.authRegisterClient(dto);
        return response;
    }
    async logout() {

        const response = await this.api.authLogout();
        return response;
    }

    async me() {
        const response = await this.api.authMe();
        return response;
    }
};
