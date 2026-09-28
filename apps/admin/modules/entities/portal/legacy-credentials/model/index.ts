import type { UpdatePortalOuterDto } from '@workspace/nest-admin-api';

/** Тело записи кредов портала в Laravel (online): все шесть полей обязательны. */
export type LegacyCredentialsSave = UpdatePortalOuterDto;

/**
 * Креды портала в Laravel (online), уже расшифрованные им самим.
 * У GET portal-outer/domain/:domain в Swagger нет схемы ответа (void),
 * поэтому используемые поля описаны руками; остальное в ответе игнорируем.
 */
export interface LegacyCredentials {
    /** Ключ, с которым бэки ходят в Битрикс: `rest/<ID>/<код>`. */
    key?: string;
    C_REST_CLIENT_ID?: string;
    C_REST_CLIENT_SECRET?: string;
    /** Тот же вебхук для PHP-стороны online. */
    C_REST_WEB_HOOK_URL?: string;
}

/** Что станет с client ID/secret при записи нового ключа. */
export type SecretsCarryOver = 'follow' | 'keep' | 'mixed';
