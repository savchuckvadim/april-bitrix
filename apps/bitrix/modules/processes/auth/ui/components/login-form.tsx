'use client'

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { FormFieldInput } from "@workspace/ui/shared";
import { AlertTriangle, LogIn } from "lucide-react";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { ILoginForm } from "../../model/types";
import { useAuth } from "../../lib/hooks";

export const LoginForm = () => {
    const { login, isLoading, error } = useAuth();
    const { control, handleSubmit } = useForm<ILoginForm>();
    const onSubmit: SubmitHandler<ILoginForm> = (data) => login(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldInput
                control={control}
                name="domain"
                label="Domain"
                placeholder="your-domain.bitrix24.ru"
                rules={{ required: "Обязательное поле" }}
                required
            />

            <FormFieldInput
                control={control}
                name="email"
                label="Email"
                type="email"
                placeholder="your@email.com"
                rules={{ required: "Обязательное поле" }}
                required
            />

            <FormFieldInput
                control={control}
                name="password"
                label="Пароль"
                type="password"
                placeholder="Введите пароль"
                rules={{ required: "Обязательное поле" }}
                required
            />

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-end">
                <Link
                    href="/auth/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    Забыли пароль?
                </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Вход...
                    </>
                ) : (
                    <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Войти
                    </>
                )}
            </Button>
        </form>
    );
};
