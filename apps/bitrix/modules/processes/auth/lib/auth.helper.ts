import { apiAuth } from '@/modules/shared/api';
import type { ClientRegistrationRequestDto, ForgotPasswordDto, LoginDto, ResetPasswordDto } from '@workspace/nest-api';

export class AuthHelper {
    async login(dto: LoginDto) {
        const response = await apiAuth.authLogin(dto);
        return { user: response.user, client: response.client };
    }

    async register(dto: ClientRegistrationRequestDto) {
        return apiAuth.authRegisterClient(dto);
    }

    async logout() {
        return apiAuth.authLogout();
    }

    async me() {
        return apiAuth.authMe();
    }

    async resendConfirmation(email: string) {
        return apiAuth.authResendConfirmation({ email });
    }

    async forgotPassword(email: string) {
        return apiAuth.authForgotPassword({ email });
    }

    async resetPassword(token: string, password: string) {
        return apiAuth.authResetPassword({ token, password });
    }

    async validateResetPasswordToken(token: string) {
        return apiAuth.authValidateResetPasswordToken(token);
    }
}
