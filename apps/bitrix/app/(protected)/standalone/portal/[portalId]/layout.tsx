'use client';
import { useParams } from 'next/navigation';


export default function PortalDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const params = useParams();
    const portalId = params.portalId as string;
    console.log('portalId', portalId);



    console.log('PortalDashboardLayout');


    // console.log('PortalDashboardLayout');

    // if (isLoading) {
    //     return (
    //         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    //             <Loader className="h-12 w-12 animate-spin text-blue-600" />
    //         </div>
    //     );
    // }

    // if (error || !portal) {
    //     return (
    //         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    //             <Alert className="max-w-md">
    //                 <AlertTriangle className="h-4 w-4" />
    //                 <AlertDescription>
    //                     {error || 'Портал не найден'}
    //                 </AlertDescription>
    //             </Alert>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen  w-full">
            {/* Навигационная панель */}
            <nav className="bg-white border-b shadow-sm">


            </nav>

            {children}
        </div>
    );
}
