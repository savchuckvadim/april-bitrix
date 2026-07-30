'use client';

import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { UseCreateAppFormReturn } from './useCreateAppForm';

interface InstructionsCardProps {
    config: UseCreateAppFormReturn['config'];
    selectedPortal: UseCreateAppFormReturn['selectedPortal'];
}

export function InstructionsCard({ config, selectedPortal }: InstructionsCardProps) {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Инструкции по настройке</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">1</span>
                        </div>
                        <Link
                            className='text-blue-600 hover:text-blue-800 hover:underline'
                            href={`https://${config.domain || selectedPortal?.domain as string || 'your-portal.bitrix24.ru'}/devops/section/standard/`}
                            target='_blank'>
                            Перейдите в настройки приложений Битрикс24
                        </Link>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">2</span>
                        </div>
                        <p>Создайте новое Локальное приложение или выберите существующее</p>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">3</span>
                        </div>
                        <p>В битрикс в созданном приложении укажите URL приложения и Путь для первоначальной установки приложения из формы</p>
                    </div>

                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-semibold text-blue-600">4</span>
                        </div>
                        <p>Скопируйте Client ID и Client Secret в форму</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-4"
                    onClick={() => window.open(`https://${config.domain || selectedPortal?.domain as string || 'your-portal.bitrix24.ru'}/devops/section/standard/`, '_blank')}
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Открыть настройки приложений
                </Button>
            </CardContent>
        </Card>
    );
}

