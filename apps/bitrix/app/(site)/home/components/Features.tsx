'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Settings, Zap, Users, BarChart3 } from 'lucide-react';

const features = [
    {
        icon: Settings,
        title: 'Полная настройка CRM',
        description: 'Комплексная настройка автоматизации под ваши бизнес-процессы. Все работает из коробки.',
    },
    {
        icon: Zap,
        title: 'Интеграция с системами',
        description: 'Подключение к существующим системам и автоматизация обмена данными.',
    },
    {
        icon: Users,
        title: 'Готовые интерфейсы для менеджера',
        description: 'Простое рабочее место — менеджер не пропустит ни одного клиента, презентацию или счет.',
    },
    {
        icon: BarChart3,
        title: 'Аналитика и KPI',
        description: 'Руководитель видит KPI в реальном времени и может влиять на результат, увеличивая продажи.',
    },
];

export const Features: React.FC = () => {
    return (
        <section id="services" className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Что мы делаем
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Полная настройка автоматизации под бизнес-процессы вашей компании
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2 text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {feature.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

