'use client';

import { useEffect, useState } from 'react';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

import { getBxService } from '@workspace/api';
import { BxInstall } from '@/modules/features';
import dynamic from 'next/dynamic';

const DynamicBxInstall = dynamic(() => import('@/modules/features')
    .then(mod => mod.BxInstall), {
    ssr: false,
});
// export default function InstallPage({

// }) {
//     const [isLoading, setIsLoading] = useState(true);

//     console.log('BITRIX APP');
//     console.log('installStatus');

//     const [status, setStatus] = useState('loading...');
//     useEffect(() => {
//         // if (installStatus === "success") {
//         // 👇 Асинхронно вызываем метод install
//         (async () => {
//             try {
//                 const BX24 = await getBxService();
//                 console.log('BX24');
//                 // const plcResult = await BX24.callMethod('placement.bind', {
//                 //     PLACEMENT: 'CRM_COMPANY_DETAIL_TAB',
//                 //     HANDLER:
//                 //         'https://front.april-app.ru/event/app/placement.php',
//                 //     OPTIONS: {
//                 //         errorHandlerUrl:
//                 //             'https://front.april-app.ru/event/app/placement.php',
//                 //     },
//                 //     TITLE: 'Test Звонки bind',
//                 //     DESCRIPTION: 'description',
//                 //     GROUP_NAME: 'event_sales',
//                 // });
//                 // const plcResultDeal = await BX24.callMethod('placement.bind', {
//                 //     PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
//                 //     HANDLER:
//                 //         'https://front.april-app.ru/event/app/placement.php',
//                 //     OPTIONS: {
//                 //         errorHandlerUrl:
//                 //             'https://front.april-app.ru/event/app/placement.php',
//                 //     },
//                 //     TITLE: 'Test Звонки bind',
//                 //     DESCRIPTION: 'description',
//                 //     GROUP_NAME: 'event_sales',
//                 // });

//                 // const KonstructorResult = await BX24.callMethod(
//                 //     'placement.bind',
//                 //     {
//                 //         PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
//                 //         HANDLER:
//                 //             'https://april-bitrix-main.vercel.app/api/placement/konstructor',
//                 //         OPTIONS: {
//                 //             errorHandlerUrl:
//                 //                 'https://front.april-app.ru/event/app/placement.php',
//                 //         },
//                 //         TITLE: 'Test Konstructor bind',
//                 //         DESCRIPTION: 'description',
//                 //         GROUP_NAME: 'konstructor_sales',
//                 //     },
//                 // );

//                 // const KonstructorGETResult = await BX24.callMethod(
//                 //     'placement.bind',
//                 //     {
//                 //         PLACEMENT: 'CRM_DEAL_DETAIL_TAB',
//                 //         HANDLER:
//                 //             'https://april-bitrix-main.vercel.app/placement/konstructor',
//                 //         OPTIONS: {
//                 //             errorHandlerUrl:
//                 //                 'https://front.april-app.ru/event/app/placement.php',
//                 //         },
//                 //         TITLE: 'Test Konstructor GET bind',
//                 //         DESCRIPTION: 'description',
//                 //         GROUP_NAME: 'konstructor_sales_get',
//                 //     },
//                 // );

//                 // console.log('KonstructorGETResult');

//                 // console.log(KonstructorGETResult.getData().result);

//                 const list = await BX24.callMethod('placement.list');

//                 console.log('installStatus async effect');


//                 console.log('plcmnts list');

//                 console.log(list.getData().result);



//                 const installFinish = await BX24.installFinish();

//                 console.log('✅ installFinish выполнен через SDK');
//                 console.log(installFinish);
//                 setStatus('success');
//                 setIsLoading(false);
//             } catch (err) {
//                 console.error('Ошибка при вызове installFinish:', err);
//                 setStatus('fail');
//                 setIsLoading(false);
//             }
//         })();
//         // }
//     }, []);

//     let message = '✅ Установка прошла успешно!';
//     // if (status === 'success') {
//     //     message = '✅ Установка прошла успешно!';
//     // } else if (status === 'fail') {
//     //     message = '❌ Ошибка установки.';
//     // }

//     return (
//         <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
//             <div className="flex flex-col items-center justify-center gap-4">
//                 <h1 className="text-2xl text-white font-bold">
//                     Статус установки
//                 </h1>
//                 <p className="text-white">{status}</p>
//                 {isLoading ? <p className="text-white">⏳ Ожидание установки...</p> :
//                     <p className="text-white">{message}</p>
//                 }
//                 <Link href="/standalone">
//                     <Button size="sm" className="bg-white text-black">
//                         На главную
//                     </Button>
//                 </Link>
//             </div>
//         </div>
//     );
// }



export default function InstallPage({

}) {


    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl text-white font-bold">
                    Статус установки
                </h1>
                <DynamicBxInstall />
            </div>
        </div>
    );
}
