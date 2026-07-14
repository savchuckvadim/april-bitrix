import React from 'react';
import { Header } from '../(app)/home/components/Header';
import { Footer } from '../(app)/home/components/Footer';
import { SupportContacts } from './components/SupportContacts';
import { SupportRequestGuide } from './components/SupportRequestGuide';
import { SUPPORT_TITLE, SUPPORT_SUBTITLE } from './constants/support';

export const metadata = {
    title: 'Поддержка — приложение «Менеджер Гарант» для Битрикс24',
    description:
        'Техническая поддержка приложения «Менеджер Гарант» для Битрикс24: контакты, режим работы, сроки ответа.',
};

export default function SupportPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
                    <header className="mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                            {SUPPORT_TITLE}
                        </h1>
                        <p className="text-lg text-muted-foreground">{SUPPORT_SUBTITLE}</p>
                    </header>
                    <SupportContacts />
                    <SupportRequestGuide />
                </div>
            </main>
            <Footer />
        </div>
    );
}
