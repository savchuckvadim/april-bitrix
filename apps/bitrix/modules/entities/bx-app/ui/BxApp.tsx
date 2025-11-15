'use client';

import { useBxApps } from "../lib/bx-app.hook";
import { usePortal } from "../../portal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { EnabledApps } from "./EnabledApps/EnabledApps";
import { PortalApps } from "./PortalApps/PortalApps";
import { Info } from "@/modules/shared/components/Info/Info";
import { CurrentApps } from "./PortalApps/components/CurrentApps/CurrentApps";

export const BxApp = () => {

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

        <>
            <h1>BxApp</h1>
            <Info title="BxApp" type="error">
                {hasntEnabledApps && <div>Нет доступных приложений</div>}
                {hasntPortalApps && <div>Нет установленных приложений</div>}
            </Info>

            <Tabs>
                <TabsList>
                    <TabsTrigger value="enabled-apps">Доступные приложения</TabsTrigger>
                    {<TabsTrigger value="portal-apps">Установленные приложения</TabsTrigger>}
                </TabsList>
                <TabsContent value="enabled-apps">
                    <EnabledApps portalId={Number(portalId)} />
                </TabsContent>
                <TabsContent value="portal-apps">
                    <CurrentApps apps={portalApps ?? []} portalId={Number(portalId)} />
                </TabsContent>
            </Tabs>


        </>
    );
};
