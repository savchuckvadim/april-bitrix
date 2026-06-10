
export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="flex-1 overflow-y-auto">
                <div className="container mx-auto p-6">{children}</div>
            </main>
        </>
    );
}

