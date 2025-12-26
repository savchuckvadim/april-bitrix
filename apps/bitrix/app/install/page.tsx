'use client';
import { BitrixInstallPage } from "@/modules/pages";
// import dynamic from "next/dynamic";

// const DynamicBitrixInstallPage = dynamic(() => import('@/modules/bitrix/pages/ui/BitrixInstallPage').then(mod => mod.BitrixInstallPage), {
//     ssr: false,
// });


// install/page.tsx
// interface InstallPageProps {
//   searchParams: {
//     install?: 'success' | 'fail';
//   };
// }

// app/install/page.tsx
// interface PageProps {
//   searchParams?: {
//     [key: string]: string | string[] | undefined;
//   };
// }

// export default function InstallPage() {

//     console.log('InstallPage');

//     return (
//         <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
//             <BitrixInstallPage />
//         </div>
//     );
// }



export default async function InstallPage({
    searchParams,
}: {
    searchParams: Promise<{ install: 'success' | 'fail' }>;
}) {
    const params = await searchParams;
    console.log('params');
    console.log(params);

    const installParam = params?.install;
    const installStatus = Array.isArray(installParam)
        ? installParam[0]
        : installParam;

    return (
        <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
            <BitrixInstallPage />
        </div>
    );
}
