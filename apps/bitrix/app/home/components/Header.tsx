'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { ThemeTogglePanel } from './ThemeTogglePanel';
import { scrollToSectionWithSource } from '../utils/tracking';
import { cn } from '@workspace/ui/lib/utils';

const navigation = [
    { name: 'Виджеты', href: '#documents' },
    // { name: 'Звонки', href: '#calls' },
    // { name: 'KPI', href: '#kpi' },
    { name: 'Bitrix', href: '#deals' },
    { name: 'О нас', href: '#about-us' },
    // { name: 'Списки', href: '#lists' },
    { name: 'Как работает', href: '#how-it-works' },

    { name: 'Предложение', href: '#commercial-proposal' },
    // { name: 'Кейсы', href: '#testimonials' },
    // { name: 'Цены', href: '#pricing' },
    { name: 'Контакты', href: '#contact' },
];

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');

    // Отслеживание скролла для изменения стиля header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Отслеживание активной секции с помощью Intersection Observer
    useEffect(() => {
        const sections = navigation.map((item) => item.href.substring(1)); // Убираем #
        sections.push('hero'); // Добавляем hero секцию

        // Обработка начального хэша при загрузке страницы
        const handleInitialHash = () => {
            if (window.location.hash) {
                const hash = window.location.hash;
                setActiveSection(hash);
                // Небольшая задержка для того, чтобы страница успела загрузиться
                setTimeout(() => {
                    const element = document.querySelector(hash);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            } else {
                setActiveSection('#hero');
            }
        };

        handleInitialHash();

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // Секция считается активной когда она в верхней части экрана
            threshold: 0,
        };

        const observers: IntersectionObserver[] = [];

        sections.forEach((sectionId) => {
            const section = document.getElementById(sectionId);
            if (section) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setActiveSection(`#${sectionId}`);
                                // Обновляем URL без перезагрузки страницы
                                if (window.history.replaceState) {
                                    const newUrl = sectionId === 'hero'
                                        ? window.location.pathname
                                        : `${window.location.pathname}#${sectionId}`;
                                    window.history.replaceState(null, '', newUrl);
                                }
                            }
                        });
                    },
                    observerOptions
                );
                observer.observe(section);
                observers.push(observer);
            }
        });

        // Обработка изменения хэша (кнопка "Назад" браузера)
        const handleHashChange = () => {
            const hash = window.location.hash || '#hero';
            setActiveSection(hash);
            const element = document.querySelector(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            observers.forEach((observer) => observer.disconnect());
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            // Если это переход на форму контактов, сохраняем источник
            if (href === '#contact') {
                scrollToSectionWithSource(href, 'header');
            } else {
                element.scrollIntoView({ behavior: 'smooth' });
            }
            // Обновляем URL
            const sectionId = href.substring(1);
            if (window.history.pushState) {
                const newUrl = sectionId === 'hero'
                    ? window.location.pathname
                    : `${window.location.pathname}${href}`;
                window.history.pushState(null, '', newUrl);
            }
            setIsMobileMenuOpen(false);
        }
    };
    if (!isScrolled) {
        return null;
    }

    return (
        <header
            // className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
            //     ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm'
            //     : 'bg-background'
            //     }`}



            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm'
                : 'bg-background/1 backdrop-blur text-primary supports-[backdrop-filter]:bg-background/10 shadow-sm'
                }`}
        >
            <nav className="container mx-auto px-2 sm:px-4 lg:px-1">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex flex-row items-end gap-2 cursor-pointer">
                        <Link href="/home">
                            <button
                                onClick={() => scrollToSection('#hero')}
                                className="flex flex-row items-end gap-2 cursor-pointer"
                            >
                                <Image
                                    src="/logo/logo.svg"
                                    alt="April CRM"
                                    width={200}
                                    height={100}
                                    className="h-10 w-auto"
                                />
                                <h1 className="text-2xl align-bottom font-bold  text-primary hidden lg:block tracking-tight   ">
                                    Апрель
                                </h1>

                            </button>


                        </Link>


                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-8">
                        {navigation.map((item) => {
                            const isActive = activeSection === item.href;
                            return (
                                <button
                                    key={item.name}
                                    onClick={() => scrollToSection(item.href)}
                                    style={{
                                        cursor: 'pointer',
                                    }}
                                    className={`text-sm font-medium transition-colors relative ${isActive
                                        ? isScrolled
                                            ? 'text-primary font-semibold'
                                            : 'text-white font-semibold'
                                        : isScrolled
                                            ? 'text-foreground hover:text-primary'
                                            : 'text-primary hover:text-white'
                                        }`}
                                >
                                    {item.name}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* CTA Buttons */}

                    <div className="hidden lg:flex lg:items-center lg:space-x-4">
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                onClick={() => console.log('/auth/login')}
                            >
                                Вход в ЛК
                            </Button>
                        </Link>
                        <Link href="/auth/login">
                            <Button
                                onClick={() => console.log('/auth/login')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Зарегистрироваться
                            </Button>
                        </Link>
                        <div className="w-[10px]">
                            <ThemeTogglePanel />
                        </div>

                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <div className={cn(
                        "lg:hidden py-4 border-t h-screen",
                        // 'bg-background backdrop-blur text-primary supports-[backdrop-filter]:bg-background/10 shadow-sm'
                    )}>
                        <div className="flex flex-col space-y-4 bg-background p-2 rounded-lg">
                            {navigation.map((item) => {
                                const isActive = activeSection === item.href;
                                return (
                                    <button
                                        key={item.name}
                                        onClick={() => scrollToSection(item.href)}
                                        className={`text-base font-medium transition-colors text-left ${isActive
                                            ? 'text-primary font-semibold border-l-2 border-primary pl-2'
                                            : 'text-foreground hover:text-primary'
                                            }`}
                                    >
                                        {item.name}
                                    </button>
                                );
                            })}
                            <div className="flex flex-col space-y-2 pt-4 border-t">
                                <Link href="/auth/login">
                                    <Button
                                        variant="outline"
                                        onClick={() => console.log('#contact')}
                                        className="w-full"
                                    >
                                        Вход в ЛК
                                    </Button>
                                </Link>
                                <Link href="/auth/login">
                                    <Button
                                        onClick={() => console.log('#contact')}
                                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                    >
                                        Зарегистрироваться
                                    </Button>

                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

