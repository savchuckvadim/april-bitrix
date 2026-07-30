'use client'
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { FileText, Zap, MapPin, CheckCircle2, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import Image from 'next/image';

const features = [
    {
        icon: FileText,
        title: 'Быстрые и расширенные КП',
        description: 'Создание коммерческих предложений за минуты с большим количеством информационных блоков',
    },
    {
        icon: FileText,
        title: 'Счета и договоры',
        description: 'Автоматическое формирование счетов и договоров по готовым шаблонам',
    },
    {
        icon: MapPin,
        title: 'Шаблоны под регионы',
        description: 'Поддержка различных регионов, типов договоров и специфики работы',
    },
    {
        icon: Zap,
        title: 'Автозаполнение',
        description: 'Автоматическое заполнение полей по данным из CRM — никаких ошибок',
    },
    {
        icon: Settings,
        title: 'Логика ГАРАНТа встроена',
        description: 'Правила оформления документов ГАРАНТа уже учтены в системе',
    },
    {
        icon: BarChart3,
        title: 'Все в статистику KPI',
        description: 'Каждый документ автоматически сохраняется в единую систему KPI и отчётности',
    },
];

const images = [
    {
        src: '/demo/konstructor_complect.png',
        alt: 'Конструктор документов - Комплект',
    },
    {
        src: '/demo/konstructor_acii.png',
        alt: 'Конструктор документов - АЦИИ',
    },
    {
        src: '/demo/konstructor_rq.png',
        alt: 'Конструктор документов - Модуль реквизиты',
    },
    {
        src: '/demo/konstructor_contracts.png',
        alt: 'Конструктор документов - Типы Договоров',
    },
    {
        src: '/demo/konstructor_maximum.png',
        alt: 'Конструктор документов - Максимум',
    },
    {
        src: '/demo/konstructor_rq_2.png',
        alt: 'Конструктор документов - Модуль реквизиты',
    },


];

export const DocumentBuilder: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        // Приоритетная загрузка видео для hero секции
        if (videoRef.current) {
            videoRef.current.load();
        }
    }, []);


    const handleVideoLoaded = () => {
        setIsVideoLoaded(true);
    };
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
        <section id="documents" className="py-20 lg:py-28">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="h-24 w-24 text-primary" />
                            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
                                Умный конструктор документов
                            </h2>
                        </div>
                        <p className="text-lg text-muted-foreground mb-6">
                            Профессиональный редактор, который знает правила оформления документов ГАРАНТа.
                            Менеджер тратит минуты, а не часы. Количество ошибок стремится к нулю.
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

                        <div className="relative aspect-video rounded-lg overflow-hidden group">
                            {/* Images */}
                            {/* {images.map((image, index) => (
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
                                    ))} */}

                            {/* Navigation Buttons */}
                            {/* <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white z-10"
                                        onClick={prevSlide}
                                        aria-label="Предыдущее изображение"
                                    >
                                        <ChevronLeft className="h-6 w-6" />
                                    </Button> */}
                            {/* <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white z-10"
                                        onClick={nextSlide}
                                        aria-label="Следующее изображение"
                                    >
                                        <ChevronRight className="h-6 w-6" />
                                    </Button> */}

                            {/* Dots Indicator */}
                            {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
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
                                    </div> */}


                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="metadata"
                                onLoadedData={handleVideoLoaded}
                                className="absolute  w-full h-full object-cover"

                            >
                                <source src="/video/konstructor.mp4" type="video/mp4" />
                                {/* Fallback для браузеров без поддержки видео */}
                            </video>

                            {/* Overlay для читаемости текста */}

                            {/* Дополнительный градиент для лучшей читаемости */}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

