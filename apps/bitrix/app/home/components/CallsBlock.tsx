'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Phone, Calendar, CheckCircle2, BarChart3, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';

const features = [
    {
        icon: Phone,
        title: 'Учет звонков',
        description: 'Автоматический учет всех звонков с клиентами и компаниями',
    },
    {
        icon: Calendar,
        title: 'Планирование звонков',
        description: 'Виджет планирования событий и звонков с напоминаниями',
    },
    {
        icon: CheckCircle2,
        title: 'Учет презентаций',
        description: 'Фиксация всех проведенных презентаций с результатами',
    },
    {
        icon: BarChart3,
        title: 'Статистика активности',
        description: 'Автоматический подсчет звонков и активности менеджеров',
    },
    {
        icon: Users,
        title: 'Рабочее место менеджера',
        description: 'Все инструменты для ежедневной работы в одном месте',
    },
    // {
    //     icon: Clock,
    //     title: 'Контроль времени',
    //     description: 'Отслеживание времени на звонки и презентации',
    // },
];
const images = [
    {
        src: '/demo/calling_ui.png',
        alt: 'Приложение Звонки для учета звонков и презентаций',
    },
    {
        src: '/demo/calling_ui2.png',
        alt: 'Приложение Звонки для учета звонков и презентаций',
    },
    {
        src: '/demo/calling_tasks.png',
        alt: 'Приложение Звонки для учета звонков и презентаций',
    },
];

export const CallsBlock: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Автоматическая прокрутка
    useEffect(() => {
        if (!isHovered) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, 4000); // Переключение каждые 4 секунды
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isHovered]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <section id="calls" className="py-20 lg:py-28 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Phone className="h-24 w-24 text-primary" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Звонки — учет звонков, презентаций и рабочее место менеджера
                            </h2>
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">
                            Встраиваемое приложение для учета звонков, презентаций и организации рабочего места менеджера.
                            Все инструменты для ежедневной работы собраны в одном месте.
                        </p>

                        <div className="space-y-4 mb-8">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={index} className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground mb-1">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Visual - Carousel */}
                    <div className="relative">

                        <div
                            className="relative aspect-video rounded-lg overflow-hidden group"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {/* Images */}
                            {images.map((image, index) => (
                                <div
                                    key={index}
                                    className={`absolute inset-0 transition-opacity duration-500 ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                                        }`}
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                    />
                                </div>
                            ))}

                            {/* Navigation Buttons */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white z-10"
                                onClick={prevSlide}
                                aria-label="Предыдущее изображение"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white z-10"
                                onClick={nextSlide}
                                aria-label="Следующее изображение"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </Button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToSlide(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                            ? 'bg-white w-8'
                                            : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                        aria-label={`Перейти к слайду ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

