'use client'
import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { ArrowRight, Link2Off, Play } from 'lucide-react';
import Image from 'next/image';
import { scrollToSectionWithSource } from '../utils/tracking';
import Orb from '@workspace/ui/components/Orb';
import Aurora from '@workspace/ui/components/Aurora';
import LiquidEther from '@workspace/ui/components/LiquidEther';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';


export const Hero2: React.FC = () => {

    // const { theme } = useTheme();
    const isDark = false;
    return (
        <section id="hero" className={
            cn(
                "relative min-h-screen flex items-center justify-center overflow-hidden"
            )
        }
        style={{
            backgroundColor: '#292b37'
        }}
        >
            {/* Video Background */}
            <div className="absolute inset-0">
                <Orb hoverIntensity={0.2} />
            </div>


            {/* Content */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-lg">
                        Готовая CRM для партнёров ГАРАНТ.{' '}
                        <p className="text-primary">
                            Внедряется за 5 минут. Заменяет дорогостоящие внедрения.
                        </p>
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
                        <Link href="/auth/login">
                            <Button
                                size="lg"
                                // onClick={() => scrollToSectionWithSource('#contact', 'hero_video')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 shadow-lg"
                            >
                                Установить модуль
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => scrollToSectionWithSource('#contact', 'hero_video')}
                            className="text-lg px-8 py-6
                            bg-white/10 backdrop-blur-sm
                            border-white/20
                            text-white
                            hover:bg-white/20"
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

