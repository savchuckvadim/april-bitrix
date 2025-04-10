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
export default async function InstallPage({ searchParams }: { searchParams: Promise<{ install: 'success' | 'fail' }> }) {


  const params = await searchParams
  console.log('params')
  console.log(params)
  debugger
  const installParam = params?.install;
  const installStatus = Array.isArray(installParam)
    ? installParam[0]
    : installParam;



  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
      <BitrixInstallPage installStatus={installStatus} />
    </div>
  )
}
