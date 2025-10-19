'use client'
import { useState } from "react";
import { Label } from "@workspace/ui/components/label";
import { Input } from "@workspace/ui/components/input";
import { Alert } from "@workspace/ui/components/alert";
import { AlertDescription } from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { LogIn, Eye } from "lucide-react";
import { EyeOff, AlertTriangle } from "lucide-react";
import { ILoginForm } from "../../model/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { useAuth } from "../../lib/hooks";


export const LoginForm = () => {


    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ILoginForm>()
    const onSubmit: SubmitHandler<ILoginForm> = (data) => login(data);


    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="login-domain">Domain</Label>
                <Input
                    id="login-domain"
                    type="text"
                    placeholder="your-domain.bitrix24.ru"
                    defaultValue={watch('domain')}
                    {...register("domain")}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    defaultValue={watch('email')}
                    {...register("email")}
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="login-password">Пароль</Label>
                <div className="relative">
                    <Input
                        id="login-password"
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
            {(error || errors.domain || errors.email || errors.password) && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error || errors.domain?.message || errors.email?.message || errors.password?.message}</AlertDescription>
                </Alert>
            )}
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
