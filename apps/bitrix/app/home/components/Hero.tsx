'use client'
import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

export const Hero: React.FC = () => {
    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center pt-16 lg:pt-20 overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content */}
                    <div className="text-center lg:text-left">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
                            CRM под ключ для отделов продаж и сервиса —{' '}
                            <span className="text-primary">
                                запущена за недели, а не месяцы
                            </span>
                        </h1>
                        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                            Полная автоматизация работы менеджеров и прозрачная аналитика KPI.
                            Клиент получает рабочую систему в короткие сроки вместо нескольких месяцев дорогих внедрений.
                        </p>

                        {/* Trust indicators */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mb-8 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Внедрили у 50+ компаний</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                <span>Запуск за 2-4 недели</span>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <Button
                                size="lg"
                                onClick={() => scrollToSection('#contact')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
                            >
                                Зарегистрироваться
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => scrollToSection('#contact')}
                                className="text-lg px-8 py-6"
                            >
                                <Play className="mr-2 h-5 w-5" />
                                Заказать демо
                            </Button>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="relative">
                        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl border">
                            <Image
                                src="/feat.jpg"
                                alt="Интерфейс CRM для менеджеров"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

