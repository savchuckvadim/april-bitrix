import { customAxios } from '@workspace/nest-admin-api';

/** Итог проверки канала (бэк: @lib/cabinet `admin/cabinet/checks/*`). */
export interface CabinetCheckResult {
    ok: boolean;
    message: string;
}

/** Итог тестового письма; details — проба DNS и портов, если не соединились. */
export interface MailCheckResult extends CabinetCheckResult {
    details: string[];
}

/** Настройка исходящей почты из окружения сервера — без пароля. */
export interface MailTransportStatus {
    configured: boolean;
    host: string | null;
    port: number | null;
    /** 465 — SSL сразу; иначе STARTTLS. */
    secure: boolean;
    login: string | null;
    passwordSet: boolean;
    from: string;
    /** Что в настройке не так — по-русски. */
    warnings: string[];
}

const MAIL_CHECK_API = '/api/admin/cabinet/checks/mail';

/** Проверки каналов кабинета: путь руками поверх общего `customAxios`. */
export class CabinetChecksHelper {
    /** Что задано для почты в окружении (MAIL_*, SMTP_FROM). */
    mailStatus(): Promise<MailTransportStatus> {
        return customAxios<MailTransportStatus>({ url: MAIL_CHECK_API, method: 'GET' });
    }

    /** Тестовое письмо через SMTP: отказ — с причиной и пробой портов. */
    testMail(email: string): Promise<MailCheckResult> {
        return customAxios<MailCheckResult>({
            url: MAIL_CHECK_API,
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
