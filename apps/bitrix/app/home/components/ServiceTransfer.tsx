'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Kanban, CheckCircle2, FileText, Shield, ArrowRight } from 'lucide-react';

const features = [
    {
        icon: Kanban,
        title: 'Канбан с согласованиями',
        description: 'Интерактивный канбан передачи клиента с автоматическими этапами согласования',
    },
    {
        icon: Shield,
        title: 'Роботы проверки',
        description: 'Автоматическая проверка обязательных данных и исключение человеческих ошибок',
    },
    {
        icon: FileText,
        title: 'Word / PDF отчёты',
        description: 'Автоматическое формирование отчётов в различных форматах для документооборота',
    },
    {
        icon: CheckCircle2,
        title: 'Весь процесс под контролем',
        description: 'Отслеживание каждого этапа передачи клиента в отдел сервиса',
    },
];

export const ServiceTransfer: React.FC = () => {
    return (
        <section id='service-transfer' className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Автоматизированная передача клиента в отдел сервиса
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        После продажи автоматически формируется процесс передачи клиента.
                        Весь процесс под контролем. Ошибки и потери информации исключены.
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
                                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                                            {feature.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
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

