'use client'
import { Badge } from "@workspace/ui/components/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@workspace/ui/components/card";
import { Users } from "lucide-react";
import { CardContent } from "@workspace/ui/components/card";
import { Tabs } from "@workspace/ui/components/tabs";
import { TabsList } from "@workspace/ui/components/tabs";
import { TabsTrigger } from "@workspace/ui/components/tabs";
import { TabsContent } from "@workspace/ui/components/tabs";

import { useState } from "react";

import { LoginForm } from "./components/login-form";
import { RegistrationForm } from "./components/registration-form";
import { useAuth } from "../lib/hooks";
import { redirect } from "next/navigation";

export const AuthWidget = () => {
    const { isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState('login' as 'login' | 'register');
debugger
    isAuthenticated && redirect('/standalone');

    return (
        <div className="min-h-screen bg-background/90">
            {/* Навигационная панель */}
            <nav className="bg-background/90 border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <h1 className="text-2xl font-bold text-foreground">
                                Битрикс24 Управление
                            </h1>
                            <div className="hidden md:flex items-center gap-6">
                                <span className="text-background-muted font-medium">Публичный доступ</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Badge variant="outline" className="text-primary border-primary">
                                <Users className="w-4 h-4 mr-2" />
                                Для клиентов
                            </Badge>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto p-6">
                {/* Заголовок */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Управление приложениями Битрикс24
                    </h1>
                    <p className="text-lg text-background-muted max-w-3xl mx-auto">
                        Зарегистрируйтесь и настройте интеграцию с вашим порталом Битрикс24
                    </p>
                </div>

                {/* Формы входа/регистрации */}
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <CardTitle className="text-center">Вход в систему</CardTitle>
                        <CardDescription className="text-center">
                            Войдите в свой аккаунт или создайте новый
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Вход</TabsTrigger>
                                <TabsTrigger value="register">Регистрация</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-4">
                                <LoginForm />
                            </TabsContent>

                            <TabsContent value="register" className="space-y-4">
                                <RegistrationForm />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>);
};
