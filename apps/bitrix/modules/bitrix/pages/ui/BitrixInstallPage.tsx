'use client';

import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { bxAPI, getBxService } from "@workspace/api";


export default function InstallPage({ installStatus }: { installStatus?: 'success' | 'fail' }) {
    console.log('installStatus')

    console.log(installStatus)
    const [status, setStatus] = useState('')
    useEffect(() => {

        // if (installStatus === "success") {
        // 👇 Асинхронно вызываем метод install
        (async () => {
            try {
                const BX24 = await getBxService()
                const plcResult = await BX24.callMethod('placement.bind', {
                    "PLACEMENT": "CRM_COMPANY_DETAIL_TAB",
                    "HANDLER": "https://front.april-app.ru/event/app/placement.php",
                    "OPTIONS": {
                        "errorHandlerUrl": "https://front.april-app.ru/event/app/placement.php"
                    },
                    "TITLE": "Test Звонки bind",
                    "DESCRIPTION": "description",
                    "GROUP_NAME": "event_sales",

                })
                const plcResultDeal = await BX24.callMethod('placement.bind', {
                    "PLACEMENT": "CRM_DEAL_DETAIL_TAB",
                    "HANDLER": "https://front.april-app.ru/event/app/placement.php",
                    "OPTIONS": {
                        "errorHandlerUrl": "https://front.april-app.ru/event/app/placement.php"
                    },
                    "TITLE": "Test Звонки bind",
                    "DESCRIPTION": "description",
                    "GROUP_NAME": "event_sales",

                })

                const KonstructorResult = await BX24.callMethod('placement.bind', {
                    "PLACEMENT": "CRM_DEAL_DETAIL_TAB",
                    "HANDLER": "https://april-bitrix-main.vercel.app/api/placement/konstructor",
                    "OPTIONS": {
                        "errorHandlerUrl": "https://front.april-app.ru/event/app/placement.php"
                    },
                    "TITLE": "Test Konstructor bind",
                    "DESCRIPTION": "description",
                    "GROUP_NAME": "konstructor_sales",

                })
                const list = await BX24.callMethod('placement.list',)
                console.log('KonstructorResult')

                console.log(KonstructorResult.getData())

                console.log('plcResult')

                console.log(plcResult.getData())

                console.log('plcResultDeal')

                console.log(plcResultDeal.getData())

                console.log('plcResult isSuccess')
                console.log(plcResult.isSuccess)
                console.log('installStatus async effect')


                console.log(installStatus)
                console.log('plcmnts list')

                console.log(list.getData())


                setStatus('success')

                const installFinish = await BX24.installFinish();

                console.log("✅ installFinish выполнен через SDK");
                console.log(installFinish)
            } catch (err) {
                console.error("Ошибка при вызове installFinish:", err);
                setStatus('fail')

            }
        })();
        // }
    }, [installStatus]);

    let message = "⏳ Ожидание установки...";
    if (status === "success") {
        message = "✅ Установка прошла успешно!";
    } else if (status === "fail") {
        message = "❌ Ошибка установки.";
    }

    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
            <div className="flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl text-white font-bold">Статус установки</h1>
                <p className="text-white">{message}</p>
                <Link href="/auth/login">
                    <Button size="sm" className="bg-white text-black">На главную</Button>
                </Link>
            </div>
        </div>
    );
}
