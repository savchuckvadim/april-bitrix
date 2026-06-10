'use client'

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { FormFieldInput } from "@workspace/ui/shared";
import { AlertTriangle, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { apiAuth } from "@/modules/shared/api";
import { getApiErrorMessage } from "@workspace/nest-api";

interface ForgotPasswordForm {
    email: string;
}

export const ForgotPasswordForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const { control, handleSubmit } = useForm<ForgotPasswordForm>();

    const onSubmit: SubmitHandler<ForgotPasswordForm> = async (data) => {
        setIsLoading(true);
        setError(null);
        try {
            await apiAuth.authForgotPassword({ email: data.email });
            setIsSubmitted(true);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="space-y-4 text-center">
                <div className="flex flex-col items-center py-4 space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                    <div className="space-y-2">
                        <p className="text-lg font-medium">Проверьте почту</p>
                        <p className="text-sm text-muted-foreground">
                            Если аккаунт с таким email существует, мы отправили инструкции по сбросу пароля.
                        </p>
                    </div>
                </div>
                <Link
                    href="/auth/login"
                    className="inline-block text-sm text-primary hover:underline"
                >
                    Вернуться на страницу входа
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Введите email, привязанный к вашему аккаунту. Мы отправим ссылку для сброса пароля.
            </p>

            <FormFieldInput
                control={control}
                name="email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                rules={{ required: "Обязательное поле" }}
                required
            />

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Отправка...
                    </>
                ) : (
                    <>
                        <Mail className="w-4 h-4 mr-2" />
                        Отправить ссылку
                    </>
                )}
            </Button>

            <div className="text-center">
                <Link
                    href="/auth/login"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Вернуться на страницу входа
                </Link>
            </div>
        </form>
    );
};
