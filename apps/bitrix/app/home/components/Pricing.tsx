'use client'
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Button } from '@workspace/ui/components/button';
import { Check, ArrowRight } from 'lucide-react';

const packages = [
    {
        name: 'Стандарт',
        price: 'от 150 000 ₽',
        description: 'Базовый пакет для небольших отделов',
        features: [
            'Настройка карточек компаний и сделок',
            'Базовые отчеты KPI',
            'Интеграция с 1-2 системами',
            'Обучение команды (до 5 человек)',
            'Техническая поддержка 3 месяца',
        ],
        popular: false,
    },
    {
        name: 'Премиум',
        price: 'от 300 000 ₽',
        description: 'Полный пакет для средних и крупных отделов',
        features: [
            'Полная настройка автоматизации',
            'Расширенные отчеты KPI с кастомизацией',
            'Интеграция с неограниченным количеством систем',
            'Обучение команды (до 20 человек)',
            'Приоритетная поддержка 6 месяцев',
            'Дополнительные интерфейсы и автоматизации',
        ],
        popular: true,
    },
];

export const Pricing: React.FC = () => {
    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <section id="pricing" className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12 lg:mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Цены и пакеты
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Выберите подходящий пакет или получите индивидуальный расчёт
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto mb-8">
                    {packages.map((pkg, index) => (
                        <Card
                            key={index}
                            className={`border-2 relative ${pkg.popular
                                    ? 'border-primary shadow-lg scale-105'
                                    : 'hover:border-primary/50'
                                } transition-all`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                                        Популярный
                                    </span>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="text-2xl mb-2">{pkg.name}</CardTitle>
                                <CardDescription>{pkg.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold text-foreground">
                                        {pkg.price}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 mb-6">
                                    {pkg.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className={`w-full ${pkg.popular
                                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : ''
                                        }`}
                                    variant={pkg.popular ? 'default' : 'outline'}
                                    onClick={() => scrollToSection('#contact')}
                                >
                                    Выбрать пакет
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={() => scrollToSection('#contact')}
                    >
                        Получить точный расчёт
                    </Button>
                </div>
            </div>
        </section>
    );
};

