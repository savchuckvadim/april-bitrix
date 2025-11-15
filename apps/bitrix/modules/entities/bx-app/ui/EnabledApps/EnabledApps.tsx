'use client';
import { useBxApps } from "../../lib/bx-app.hook";
import { usePortal } from "../../../portal";
import { EnabledAppDto } from "@workspace/nest-api";

export const EnabledApps = ({ portalId }: { portalId: number }) => {
    const { enabledApps } = useBxApps(portalId);
    return (
        <div>
            {enabledApps?.length && enabledApps.map((app: EnabledAppDto) => (
                <div key={app.group.toString()}>
                    {app.code}
                </div>
            ))}
        </div>
    )

}

