import { BitrixInstallPage } from "@/modules/bitrix";



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
export default async function InstallPage({ params }: { params: Promise<{ install: 'success' | 'fail' }> }) {


  const searchParams = await params
  const installParam = searchParams?.install;
  const installStatus = Array.isArray(installParam)
    ? installParam[0]
    : installParam;



  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
      <BitrixInstallPage installStatus={installStatus === 'success' ? 'success' : 'fail'} />
    </div>
  )
}
