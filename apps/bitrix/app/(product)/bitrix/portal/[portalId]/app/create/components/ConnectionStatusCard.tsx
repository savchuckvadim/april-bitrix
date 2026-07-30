'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { UseCreateAppFormReturn } from './useCreateAppForm';

interface ConnectionStatusCardProps {
    config: UseCreateAppFormReturn['config'];
}

export function ConnectionStatusCard({ config }: ConnectionStatusCardProps) {

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Статус подключения</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Домен портала</span>
                        {config.domain ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">{config.domain}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-sm text-gray-500">Не указан</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm">Client ID</span>
                        {config.client_id ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">Настроен</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-sm text-gray-500">Не указан</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-sm">Client Secret</span>
                        {config.client_secret ? (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-green-600">Настроен</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-sm text-gray-500">Не указан</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

