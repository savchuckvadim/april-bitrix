'use client';

import { useParams } from 'next/navigation';
import { useCreateAppForm } from './components/useCreateAppForm';
import { OAuthForm } from './components/OAuthForm';
import { ConnectionStatusCard } from './components/ConnectionStatusCard';
import { InstructionsCard } from './components/InstructionsCard';
import { WarningCard } from './components/WarningCard';

export default function CreateAppPage() {
    const params = useParams();
    const portalId = params.portalId as string;
    const form = useCreateAppForm(portalId);

    return (
        <div className="min-h-screen max-w-[1900px] bg-gray-50">
            <div className="max-w-[1200px] mx-auto px-10 py-4">
                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Настройка OAuth
                    </h1>
                    <p className="text-gray-600">
                        Настройте параметры подключения к порталу Битрикс24
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Форма настройки */}
                    <OAuthForm form={form} />

                    {/* Информационная панель */}
                    <div className="space-y-6">
                        <ConnectionStatusCard config={form.config} />
                        <InstructionsCard config={form.config} selectedPortal={form.selectedPortal} />
                        <WarningCard />
                    </div>
                </div>
            </div>
        </div>
    );
}
