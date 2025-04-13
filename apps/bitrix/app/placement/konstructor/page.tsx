
// import { KonstructorApp } from "@/modules/konstructor";

// import KonstructorPage from "@/modules/konstructor"

// import dynamic from 'next/dynamic'

// Клиентский компонент, только на клиенте
'use server'

import KonstructorApp from '@/modules/konstructor'

export default async function Page({ searchParams }: { searchParams: Promise<{ inBitrix?: 'y' | 'n' }> }) {


  const params = await searchParams
  console.log('params')
  console.log(params)


  let inBitrix = false
  if (params) {
    if (params.inBitrix) {
      if (params.inBitrix === 'y') {
        inBitrix = true
      }
    }
  }


  return (
    <div className="w-screen h-screen bg-black flex items-center justify-center min-h-svh">
 
      <div className="w=1/3 h=1/3 bg-foreground text-background">
        <KonstructorApp inBitrix={inBitrix} />
      </div>

    </div>
  )
}
