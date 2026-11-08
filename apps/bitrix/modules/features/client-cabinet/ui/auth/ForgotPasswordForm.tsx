'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AButton, AInput } from '@workspace/april-ui';
import { requestPasswordReset } from '@workspace/bitrix';
import { useCabinetAction } from '../../lib/cabinet-hooks';
import { SUPPORT_EMAIL } from '../../lib/cabinet-texts';
import { AuthShell } from './AuthShell';

/** Восстановление пароля: письмо со ссылкой (действует 1 час). */
export const ForgotPasswordForm = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const action = useCabinetAction();

    const submit = async () => {
        const result = await action.run(() => requestPasswordReset(email.trim()));
        if (result) setSent(true);
    };

    return (
        <AuthShell
            title="Восстановление пароля"
            description="Пришлём ссылку для нового пароля на email учётной записи."
        >
            {sent ? (
                <p className="text-sm">
                    Если учётная запись с этим email есть и у неё открыт доступ
                    к кабинету, ссылка уже в почте. Она действует 1 час. Письма
                    нет — проверьте «Спам» или напишите нам: {SUPPORT_EMAIL}.
                </p>
            ) : (
                <>
                    <AInput<'email'>
                        label="Email"
                        type="email"
                        autoComplete="email"
                        errorMessage={null}
                        nameForHandler="email"
                        value={email}
                        handleChange={(_name, value) => setEmail(value)}
                        handleOnFocus={() => action.clearError()}
                    />
                    {action.error && (
                        <p className="text-sm text-destructive">{action.error}</p>
                    )}
                    <AButton
                        title={action.busy ? 'Отправляем…' : 'Прислать ссылку'}
                        isActive={!action.busy && email.includes('@')}
                        clickHendler={() => void submit()}
                    />
                </>
            )}
            <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Вернуться ко входу
            </Link>
        </AuthShell>
    );
};
