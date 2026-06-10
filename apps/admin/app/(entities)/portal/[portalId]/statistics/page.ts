import { redirect } from "next/navigation";
import { use } from "react";

export default function PortalStatisticsPage({
    params,
}: {
    params: Promise<{ portalId: string }>;
}) {
    const { portalId } = use(params);
    return redirect(`/portal/${portalId}/statistics/transcription`);
}
