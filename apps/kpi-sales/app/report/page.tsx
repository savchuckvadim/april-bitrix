'use client';

import App from '@/modules/app/ui/App';
// import dynamic from 'next/dynamic';

// Динамический импорт для избежания проблем с SSR
// const Report = dynamic(() => import('@/modules/entities/report/ui/Report'), {
//     ssr: false,
//     loading: () => (
//         <div className="flex justify-center items-center h-screen">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//         </div>
//     )
// });

export default function ReportPage() {
    return <App inBitrix={true} />;
} 