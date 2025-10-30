
import dynamic from "next/dynamic";

const DynamicUserReport = dynamic(() =>
    import('@/modules/entities/user-report/ui/UserReport/UserReport')
        .then(mod => mod.UserReport));


export default async function UserReportPage({
    searchParams,
}: {
    searchParams: Promise<{ userId: number }>;
}) {
    const params = await searchParams;
    const userId = params?.userId;
    if (!userId) {
        return <div>User ID is required</div>;
    }
    return (
        <div>

            <DynamicUserReport userId={Number(userId)} />
        </div>
    )
}
