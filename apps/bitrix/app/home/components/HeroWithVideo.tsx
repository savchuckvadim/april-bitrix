'use client'
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Play } from 'lucide-react';
import { scrollToSectionWithSource } from '../utils/tracking';

export const HeroWithVideo: React.FC = () => {
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

    return (
        <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onLoadedData={handleVideoLoaded}
                    className="absolute bg-black inset-0 w-full h-full object-cover"
                    // poster="/demo/processing_light.png"
                >
                    <source src="/video/hero.mp4" type="video/mp4" />
                    {/* Fallback для браузеров без поддержки видео */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/5" />
                </video>

                {/* Overlay для читаемости текста */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Дополнительный градиент для лучшей читаемости */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
                        Готовая CRM для партнёров ГАРАНТ.{' '}
                        <span className="text-primary">
                            Внедряется за 5 минут. Заменяет дорогостоящие внедрения.
                        </span>
                    </h1>
                    <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-3xl mx-auto drop-shadow-md">
                        Автоматизация продаж, КП, звонков, презентаций, KPI и документации —
                        сразу после установки в Bitrix24.
                    </p>

                    {/* Trust indicators */}
                    <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-white/90">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>5+ лет опыта с партнёрами ГАРАНТ</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span>Установка за 5 минут</span>
                        </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            onClick={() => scrollToSectionWithSource('#contact', 'hero_video')}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 shadow-lg"
                        >
                            Установить модуль
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => scrollToSectionWithSource('#contact', 'hero_video')}
                            className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
                        >
                            <Play className="mr-2 h-5 w-5" />
                            Получить демонстрацию
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

