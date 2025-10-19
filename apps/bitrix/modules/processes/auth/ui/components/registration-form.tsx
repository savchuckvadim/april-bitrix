'use client'
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { AlertTriangle, Eye, EyeOff, UserPlus } from "lucide-react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { IRegisterForm } from "../../model";
import { useAuth } from "../../lib/hooks";

export const RegistrationForm = () => {

    const [showPassword, setShowPassword] = useState(false);



    const { registerClient, isLoading, error } = useAuth();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<IRegisterForm>()
    const onSubmit: SubmitHandler<IRegisterForm> = (data) => registerClient(data);

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="register-name">Название организации</Label>
                <Input
                    id="register-name"
                    type="text"
                    placeholder="Название организации"
                    defaultValue={watch('name')}
                    {...register("name")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    defaultValue={watch('email')}
                    {...register("email")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-domain">Domain</Label>
                <Input
                    id="register-domain"
                    type="text"
                    placeholder="your-domain.bitrix24.ru"
                    defaultValue={watch('domain')}
                    {...register("domain")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-userName">Имя</Label>
                <Input
                    id="register-userName"
                    type="text"
                    placeholder="Ваше имя "
                    defaultValue={watch('userName')}
                    {...register("userName")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-userSurname">Фамилия</Label>
                <Input
                    id="register-organization"
                    type="text"
                    placeholder="Ваша фамилия"
                    defaultValue={watch('userSurname')}
                    {...register("userSurname")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-password">Пароль</Label>
                <div className="relative">
                    <Input
                        id="register-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Введите пароль"
                        defaultValue={watch('password')}
                        {...register("password")}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="register-confirm">Подтвердите пароль</Label>
                <Input
                    id="register-confirm"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Подтвердите пароль"
                    defaultValue={watch('confirmPassword')}
                    {...register("confirmPassword")}
                    required
                />
            </div>
            {(error || errors.name || errors.email || errors.userSurname || errors.userName || errors.password || errors.confirmPassword)
                && (
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
