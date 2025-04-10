
import { KonstructorApp } from "@/modules/konstructor";


export default async function InstallPage({ searchParams }: { searchParams: Promise<{ install: 'success' | 'fail' }> }) {


  const params = await searchParams
  console.log('params')
  console.log(params)




  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
      <div className="w=1/3 h=1/3 bg-foreground text-background">
        <KonstructorApp inBitrix={true} />
      </div>

    </div>
  )
}
