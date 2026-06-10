'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { AlertTriangle } from 'lucide-react';

export function WarningCard() {
    return (
        <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
                <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Важно
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm text-amber-700">
                    <p>• Никогда не передавайте Client Secret третьим лицам</p>
                    <p>• Данные сохраняются локально в браузере</p>
                    <p>• Убедитесь, что домен указан корректно</p>
                    <p>• Redirect URI должен совпадать с настройками в Битрикс24</p>
                </div>
            </CardContent>
        </Card>
    );
}

