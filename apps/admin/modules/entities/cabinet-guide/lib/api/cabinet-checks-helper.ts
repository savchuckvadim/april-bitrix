import { customAxios } from '@workspace/nest-admin-api';

/** Итог проверки канала (бэк: @lib/cabinet `admin/cabinet/checks/*`). */
export interface CabinetCheckResult {
    ok: boolean;
    message: string;
}

/** Проверки каналов кабинета: путь руками поверх общего `customAxios`. */
export class CabinetChecksHelper {
    /** Тестовое письмо через SMTP (MAIL_*), ошибка SMTP — в ответе. */
    testMail(email: string): Promise<CabinetCheckResult> {
        return customAxios<CabinetCheckResult>({
            url: '/api/admin/cabinet/checks/mail',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: { email },
        });
    }

    /** Тестовое сообщение клиентским ботом в чат привязки. */
    testTelegram(portalId: number, bindingId: string): Promise<CabinetCheckResult> {
        return customAxios<CabinetCheckResult>({
            url: `/api/admin/cabinet/portals/${portalId}/telegram/${bindingId}/test`,
            method: 'POST',
        });
    }
}
