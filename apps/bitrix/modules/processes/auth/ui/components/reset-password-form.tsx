'use client'

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { FormFieldInput } from "@workspace/ui/shared";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2, LogIn, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { apiAuth } from "@/modules/shared/api";
import { getApiErrorMessage } from "@workspace/nest-api";

interface ResetPasswordForm {
    password: string;
    confirmPassword: string;
}

type ResetState =
    | { status: 'validating' }
    | { status: 'invalid' }
    | { status: 'ready' }
    | { status: 'submitting' }
    | { status: 'success' }
    | { status: 'error'; message: string };

export const ResetPasswordForm = ({ token }: { token: string }) => {
    const [state, setState] = useState<ResetState>({ status: 'validating' });

    const { control, handleSubmit, watch } = useForm<ResetPasswordForm>();

    useEffect(() => {
        const validate = async () => {
            try {
                const result = await apiAuth.authValidateResetPasswordToken(token);
                setState(result.valid ? { status: 'ready' } : { status: 'invalid' });
            } catch {
                setState({ status: 'invalid' });
            }
        };
        validate();
    }, [token]);

    const onSubmit: SubmitHandler<ResetPasswordForm> = async (data) => {
        if (data.password !== data.confirmPassword) {
            setState({ status: 'error', message: 'Пароли не совпадают' });
            return;
        }

        setState({ status: 'submitting' });
        try {
            await apiAuth.authResetPassword({ token, password: data.password });
            setState({ status: 'success' });
        } catch (err) {
            setState({ status: 'error', message: getApiErrorMessage(err) });
        }
    };

    if (state.status === 'validating') {
        return (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Проверяем ссылку...</p>
            </div>
        );
    }

    if (state.status === 'invalid') {
        return (
            <div className="space-y-4 text-center">
                <div className="flex flex-col items-center py-4 space-y-4">
                    <XCircle className="w-16 h-16 text-destructive" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Ссылка недействительна</p>
                        <p className="text-sm text-muted-foreground">
                            Ссылка для сброса пароля истекла или уже была использована.
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Link href="/auth/forgot-password">
                        <Button variant="outline" className="w-full">
                            Запросить новую ссылку
                        </Button>
                    </Link>
                    <Link
                        href="/auth/login"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        Вернуться на страницу входа
                    </Link>
                </div>
            </div>
        );
    }

    if (state.status === 'success') {
        return (
            <div className="space-y-4 text-center">
                <div className="flex flex-col items-center py-4 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Пароль обновлён</p>
                        <p className="text-sm text-muted-foreground">
                            Теперь вы можете войти с новым паролем.
                        </p>
                    </div>
                </div>
                <Link href="/auth/login">
                    <Button className="w-full">
                        <LogIn className="w-4 h-4 mr-2" />
                        Войти
                    </Button>
                </Link>
            </div>
        );
    }

    const isSubmitting = state.status === 'submitting';
    const errorMessage = state.status === 'error' ? state.message : null;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldInput
                control={control}
                name="password"
                label="Новый пароль"
                type="password"
                placeholder="Минимум 6 символов"
                rules={{
                    required: "Обязательное поле",
                    minLength: { value: 6, message: "Минимум 6 символов" },
                }}
                required
            />

            <FormFieldInput
                control={control}
                name="confirmPassword"
                label="Подтвердите пароль"
                type="password"
                placeholder="Повторите пароль"
                rules={{
                    required: "Обязательное поле",
                    validate: (value: string) =>
                        value === watch("password") || "Пароли не совпадают",
                }}
                required
            />

            {errorMessage && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Сохранение...
                    </>
                ) : (
                    <>
                        <KeyRound className="w-4 h-4 mr-2" />
                        Сохранить новый пароль
                    </>
                )}
            </Button>
        </form>
    );
};
