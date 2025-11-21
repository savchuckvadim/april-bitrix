'use client';

import { useBxApps } from "../lib/bx-app.hook";
import { usePortal } from "../../portal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { EnabledApps } from "./EnabledApps/EnabledApps";
import { CurrentApps } from "./PortalApps/components/CurrentApps/CurrentApps";
import { Alert, AlertDescription } from "@workspace/ui/components/alert";
import { AlertTriangle, Key } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card";

export const BxApp = () => {
    debugger
    const { selectedPortal } = usePortal();
    const portalId = selectedPortal?.id;
    const {
        enabledApps,
        portalApps,
        isLoading,
        error
    } = useBxApps(Number(portalId));

    const hasntPortalApps = portalApps && portalApps.length === 0;
    const hasntEnabledApps = enabledApps && enabledApps.length === 0;

    return (

        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[1900px] mx-auto px-10 py-4">
                <h1>Настройка подключений к порталу Битрикс24</h1>
                {/* <Info title="BxApp" type="error">
                    {hasntEnabledApps && <div>Нет доступных приложений</div>}
                    {hasntPortalApps && <div>Нет установленных приложений</div>}
                </Info> */}
                <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <div className="flex items-center justify-between">
                            <span>Не настроены OAuth параметры. Настройте подключение к Битрикс24 для полноценной работы.</span>
                            <Link href={`${portalId}/app/create`}>
                                <Button size="sm" variant="outline">
                                    <Key className="w-4 h-4 mr-2" />
                                    Создать приложение
                                </Button>
                            </Link>
                        </div>
                    </AlertDescription>
                </Alert>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* <Tabs defaultValue="portal-apps">
                            <TabsList >
                                <TabsTrigger value="enabled-apps">Доступные приложения</TabsTrigger>
                                {<TabsTrigger value="portal-apps">Установленные приложения</TabsTrigger>}
                            </TabsList>
                            <TabsContent value="enabled-apps">
                                <EnabledApps portalId={Number(portalId)} />
                            </TabsContent>
                            <TabsContent value="portal-apps">
                                <CurrentApps apps={portalApps ?? []} portalId={Number(portalId)} />
                            </TabsContent>
                        </Tabs> */}
                        <CurrentApps apps={portalApps ?? []} portalId={Number(portalId)} />

                    </div>



                    <div className="col-span-1">
                        <Card> <CardHeader>
                            <CardTitle>Настройки</CardTitle>
                        </CardHeader>
                            <CardContent>
                                <div>Настройки</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div >
    );
};
