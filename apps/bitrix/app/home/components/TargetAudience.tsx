'use client'
import React from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Building2, Briefcase, Users, Target } from 'lucide-react';

const audiences = [
    {
        icon: Building2,
        title: 'Партнёры ГАРАНТ',
        description: 'Компании, продающие справочно-правовые системы ГАРАНТ',
    },
    {
        icon: Briefcase,
        title: 'Юридические компании',
        description: 'Юридические и консалтинговые организации',
    },
    {
        icon: Users,
        title: 'B2B отделы продаж',
        description: 'Отделы продаж с многоступенчатыми воронками',
    },
    {
        icon: Target,
        title: 'Консалтинговые организации',
        description: 'Компании, работающие в B2B-сегменте',
    },
];

export const TargetAudience: React.FC = () => {
    return (
        <section className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                        Для кого подходит решение
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Наш модуль создан специально для компаний, которые работают в B2B-сегменте
                        и нуждаются в автоматизации сложных процессов продаж.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {audiences.map((audience, index) => {
                        const Icon = audience.icon;
                        return (
                            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                                <CardContent className="p-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <Icon className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-2 text-foreground">
                                            {audience.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {audience.description}
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

