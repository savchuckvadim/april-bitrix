'use client'

import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { FormFieldInput } from "@workspace/ui/shared";
import { AlertTriangle, UserPlus } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IRegisterForm } from "../../model";
import { useAuth } from "../../lib/hooks";

export const RegistrationForm = () => {
    const { registerClient, isLoading, error } = useAuth();

    const { control, handleSubmit } = useForm<IRegisterForm>();

    const onSubmit: SubmitHandler<IRegisterForm> = (data) => registerClient(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormFieldInput
                control={control}
                name="name"
                label="Название организации"
                placeholder="Название организации"
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
                name="domain"
                label="Domain"
                placeholder="your-domain.bitrix24.ru"
                rules={{ required: "Обязательное поле" }}
                required
            />

            <FormFieldInput
                control={control}
                name="userName"
                label="Имя"
                placeholder="Ваше имя"
                rules={{ required: "Обязательное поле" }}
                required
            />

            <FormFieldInput
                control={control}
                name="userSurname"
                label="Фамилия"
                placeholder="Ваша фамилия"
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

            <FormFieldInput
                control={control}
                name="confirmPassword"
                label="Подтвердите пароль"
                type="password"
                placeholder="Подтвердите пароль"
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
                        Регистрация...
                    </>
                ) : (
                    <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Зарегистрироваться
                    </>
                )}
            </Button>
        </form>
    );
};
