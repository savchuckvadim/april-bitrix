'use client';

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import {
    Building,
    CheckCircle,

    Globe,
    AlertTriangle,

} from 'lucide-react';
// import {
//     APP_GROUPS,
// } from '../../modules/entities/entities';
import { useAuth } from '@/modules/processes/auth/lib/hooks';
import { usePathname, useRouter } from 'next/navigation';
import { usePortal } from '@/modules/entities/portal/lib/hooks';
import { Portal } from '@/modules/processes/auth';
import { PortalAdd } from '@/modules/entities/portal/ui/PortalAdd/PortalAdd';
import { CabinetWidget } from '@/modules/widgetes/cabinet/ui/CabinetWidget';

export default function PublicPage() {
    const { currentUser, currentClient, logout } = useAuth();
    const { selectedPortal } = usePortal();
    const router = useRouter();

    // const { portals, selectedPortal } = usePortal();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);


console.log('CabinetWidget');

    const pathname = usePathname();

    useEffect(() => {
        if (selectedPortal && pathname === '/standalone') {
            router.push(`/standalone/portal/${selectedPortal.id}`);
        }
    }, [selectedPortal, pathname]);


    // Если пользователь авторизован
    return (


        <div className=" p-0">
            {/* Уведомления */}
            {success && (
                <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
            )}

            <CabinetWidget />


        </div>

    );
}
