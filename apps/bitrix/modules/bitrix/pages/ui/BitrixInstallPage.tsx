'use client';

import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

import { bxAPI, getBxService } from "@workspace/api";


export default function InstallPage({ installStatus }: { installStatus?: 'success' | 'fail' }) {
    console.log('installStatus')

    console.log(installStatus)

    useEffect(() => {

        // if (installStatus === "success") {
        // 👇 Асинхронно вызываем метод install
        (async () => {
            const BX24 = await getBxService()
            const plcResult = await BX24.callMethod('placement.bind', {
                "PLACEMENT": "CRM_CONTACT_DETAIL_TAB",
                "HANDLER": "https://front.april-app.ru/event/app/placement.php",
                "OPTIONS": {
                    "errorHandlerUrl": "https://front.april-app.ru/event/app/placement.php"
                },
                "TITLE": "Test Звонки bind",
                "DESCRIPTION": "description",
                "GROUP_NAME": "group",
                "LANG_ALL": {
                   
                    "ru": {
                        "TITLE": "Test Звонки bind",
                        "DESCRIPTION": "Приложение звонки Гарант Продажи",
                        "GROUP_NAME": "event_sales",
                    }
                }
            })

            console.log('plcResult')

            console.log(plcResult)
            console.log('plcResult isSuccess')
            console.log(plcResult.isSuccess)
            console.log('installStatus async effect')

            console.log(installStatus)
            try {
                const installFinish =  await BX24.installFinish();
               
                console.log("✅ installFinish выполнен через SDK");
                console.log(installFinish)
            } catch (err) {
                console.error("Ошибка при вызове installFinish:", err);
            }
        })();
        // }
    }, [installStatus]);

    let message = "⏳ Ожидание установки...";
    if (installStatus === "success") {
        message = "✅ Установка прошла успешно!";
    } else if (installStatus === "fail") {
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
