'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@workspace/ui/components/card';
import { Building, Globe } from 'lucide-react';
import { Label } from '@workspace/ui/components/label';
import { Input } from '@workspace/ui/components/input';
import { Button } from '@workspace/ui/components/button';
import { useState } from 'react';
import { PortalForm } from '../../model';
import { usePortal } from '../../lib/hooks';

export const PortalAdd = () => {
    const {
        addPortal,

        isLoading,
        error,

    } = usePortal();
    const [portalForm, setPortalForm] = useState<PortalForm>({
        name: '',
        domain: ''
    });


    return <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Ваш портал Битрикс24
            </CardTitle>
            <CardDescription>
                {/* {currentUser?.portals.length === 0
                    ? 'Добавьте свой портал Битрикс24'
                    : 'Информация о подключенном портале'
                } */}
            </CardDescription>
        </CardHeader>
        <CardContent>

            <form onSubmit={(e) => addPortal(portalForm)} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="portal-name">Название портала</Label>
                    <Input
                        id="portal-name"
                        type="text"
                        placeholder="Мой портал"
                        value={portalForm.name}
                        onChange={(e) => setPortalForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="portal-domain">Домен портала</Label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            id="portal-domain"
                            type="text"
                            placeholder="your-portal.bitrix24.ru"
                            value={portalForm.domain}
                            onChange={(e) => setPortalForm(prev => ({ ...prev, domain: e.target.value }))}
                            className="pl-10"
                            required
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Формат: your-portal.bitrix24.ru
                    </p>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Добавление...
                        </>
                    ) : (
                        <>
                            <Building className="w-4 h-4 mr-2" />
                            Добавить портал
                        </>
                    )}
                </Button>
            </form>

            {error && <div className="text-red-500">{error}</div>}
        </CardContent>
    </Card>
}
