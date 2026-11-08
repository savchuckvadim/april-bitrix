'use client';

import { useParams } from 'next/navigation';
import { SetPasswordForm } from '@/modules/features/client-cabinet';

/**
 * Пароль по ссылке из письма (приглашение в кабинет или восстановление):
 * https://bitrix.april-app.ru/auth/set-password/<токен>.
 */
export default function SetPasswordPage() {
    const params = useParams<{ token: string }>();
    return <SetPasswordForm token={params.token} />;
}
