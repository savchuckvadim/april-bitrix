/**
 * Auth-данные фрейма Bitrix24 (`BX24.getAuth()` / `b24.auth.getAuthData()`),
 * которыми фронт открывает portal-context сессию бэка
 * (`POST /api/auth/portal-session` в kpi-report-sales и т.п.).
 *
 * Вне фрейма таких данных нет — `BitrixBaseApi.getFrameAuth()` отдаёт null.
 */
export interface BxFrameAuth {
    /** AUTH_ID фрейма — access_token текущего пользователя портала. */
    accessToken: string;
    /** Имя хоста портала (`april.bitrix24.ru`), как в `getInitializedData().domain`. */
    domain: string;
    /** member_id портала; null — SDK его не отдал. */
    memberId: string | null;
    /** Срок жизни access_token в секундах; null — SDK его не отдал. */
    expiresIn: number | null;
}
