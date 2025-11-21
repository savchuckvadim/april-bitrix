'use client'
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

const footerLinks = {
    services: [
        { name: 'Услуги', href: '#services' },

        { name: 'KPI', href: '#kpi' },
        { name: 'Сделки', href: '#deals' },
        { name: 'Конструктор документов', href: '#documents' },
        { name: 'Учет звонков', href: '#calls' },
    ],
    company: [
        { name: 'Как работает', href: '#how-it-works' },
        { name: 'Кейсы', href: '#testimonials' },
        { name: 'Цены', href: '#commercial-proposal' },
        { name: 'Контакты', href: '#contact' },
    ],
    legal: [
        { name: 'Политика конфиденциальности', href: '/privacy' },
        { name: 'Пользовательское соглашение', href: '/terms' },
    ],
};

export const Footer: React.FC = () => {
    const scrollToSection = (href: string) => {
        if (href.startsWith('#')) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="bg-muted border-t">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Logo and description */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <Image
                                src="/logo/logo.svg"
                                alt="April CRM"
                                width={120}
                                height={40}
                                className="h-8 w-auto"
                            />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Полная настройка CRM (Битрикс) под ключ для отделов продаж и сервиса
                        </p>
                    </div>

                    {/* Services */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Услуги</h3>
                        <ul className="space-y-2">
                            {footerLinks.services.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Компания</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <button
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Контакты</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <a
                                    href="tel:+79620027991"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    +7 (962) 002-79-91
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <a
                                    href="mailto:info@april-crm.ru"
                                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                >
                                    april-app@mail.ru
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground">
                                    Санкт-Петербург, Россия
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} April CRM. Все права защищены.
                    </p>
                    <div className="flex gap-6">
                        {/* {footerLinks.legal.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))} */}
                    </div>
                </div>
            </div>
        </footer>
    );
};

