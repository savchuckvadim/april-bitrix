'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@workspace/ui/components/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';

const navigation = [
    { name: 'Услуги', href: '#services' },
    { name: 'Как работает', href: '#how-it-works' },
    { name: 'KPI', href: '#kpi' },
    { name: 'Сделки', href: '#deals' },
    { name: 'Кейсы', href: '#testimonials' },
    { name: 'Цены', href: '#pricing' },
    { name: 'Контакты', href: '#contact' },
];

export const Header: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (href: string) => {
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm'
                : 'bg-background'
                }`}
        >
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center">
                            <Image
                                src="/logo/logo.svg"
                                alt="April CRM"
                                width={120}
                                height={40}
                                className="h-8 w-auto"
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex lg:items-center lg:space-x-8">
                        {navigation.map((item) => (
                            <button
                                key={item.name}
                                onClick={() => scrollToSection(item.href)}
                                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                            >
                                {item.name}
                            </button>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <Link href="/auth/login">
                        <div className="hidden lg:flex lg:items-center lg:space-x-4">
                            <Button
                                variant="ghost"
                                onClick={() => console.log('/auth/login')}
                            >
                                Вход в ЛК
                            </Button>
                            <Button
                                onClick={() => console.log('/auth/login')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                Зарегистрироваться
                            </Button>
                        </div>
                    </Link>
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
                    <div className="lg:hidden py-4 border-t">
                        <div className="flex flex-col space-y-4">
                            {navigation.map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => scrollToSection(item.href)}
                                    className="text-base font-medium text-foreground hover:text-primary transition-colors text-left"
                                >
                                    {item.name}
                                </button>
                            ))}
                            <div className="flex flex-col space-y-2 pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => scrollToSection('#contact')}
                                    className="w-full"
                                >
                                    Вход в ЛК
                                </Button>
                                <Button
                                    onClick={() => scrollToSection('#contact')}
                                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                    Зарегистрироваться
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};

