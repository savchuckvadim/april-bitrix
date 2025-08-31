// import { BackButton } from "@/components/BackButton";
// import { ResetButton } from "@/components/ResetButton";
import { DocumentSettingsForm } from '@/modules/widgetes/offer/create/ui/components/DocumentSettingsForm';
import { LegalInformation } from '@/modules/widgetes/offer/create/ui/components/LegalInformation';
import { PriceSettings } from '@/modules/widgetes/offer/create/ui/components/PriceSettings';
import { DocumentTable } from '@/modules/widgetes/offer/create/ui/components/DocumentTable';
import { LegalActs } from '@/modules/widgetes/offer/create/ui/components/LegalActs';

export default function Home() {
    return (
        <div className="flex h-screen bg-background text-foreground">
            {/* Left Sidebar */}
            <aside className="w-1/3 p-4">
                <div className="flex justify-between items-center mb-4">
                    {/* <BackButton />
          <ResetButton /> */}
                </div>
                <LegalInformation />
                <LegalActs />
                <PriceSettings />
            </aside>

            {/* Main Content */}
            <main className="w-2/3 p-4 flex flex-col gap-4 items-end">
                <div className="w-1/2">
                    <DocumentSettingsForm />
                </div>
                <div className="w-full">
                    <DocumentTable />
                </div>
            </main>
        </div>
    );
}
