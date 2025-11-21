'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Search, Settings, Zap, TestTube, HeadphonesIcon } from 'lucide-react';


//


const steps = [
    {
        icon: Search,
        number: '01',
        title: 'Установка приложения',
        description: 'Устанавливаем приложение в вашу систему Битрикс24 за 5 минут',
    },
    {
        icon: Settings,
        number: '02',
        title: 'Настройка форм и карточек',
        description: 'Менеджер помогает настроить формы и карточки для вашего отдела продаж',
    },
    // {
    //     icon: Zap,
    //     number: '03',
    //     title: 'Обучение менеджеров и руководителей',
    //     description: 'Подключаем необходимые системы и настраиваем автоматические процессы',
    // },
    {
        icon: TestTube,
        number: '03',
        title: 'Тестирование и обучение',
        description: 'Проводим тестирование системы и обучаем вашу команду работе с CRM',
    },
    {
        icon: HeadphonesIcon,
        number: '04',
        title: 'Поддержка',
        description: 'Обеспечиваем постоянную поддержку и развитие системы',
    },
];

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Как мы работаем
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Процесс внедрения от анализа до поддержки — всё прозрачно и быстро
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                            <div key={index} className="relative">
                                <Card className="border-2 h-full hover:border-primary/50 transition-colors">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative mb-4">
                                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Icon className="h-8 w-8 text-primary" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                                                    {step.number}
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-semibold mb-2 text-foreground">
                                                {step.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {step.description}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-10">
                                        <div className="w-4 h-4 bg-primary rounded-full" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

