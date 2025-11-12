// 'use client';

// import App from '@/modules/app/ui/App';

// export default function ReportPage() {
//     const inBitrix = process.env.IN_BITRIX as string | boolean | undefined;

//     return <App inBitrix={true} envBitrix={inBitrix} />;
// }

import { Report } from '@/modules/entities/report';
import dynamic from 'next/dynamic';


// const DynamicReport = dynamic(() => import('@/modules/entities/report/ui/Report'), { ssr: false });


export default function ReportPage() {

    return <Report />;
}
