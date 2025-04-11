// 'use client'

// import { useEffect, useState } from 'react'
// import { getPlacement } from '@/shared/api/bitrix-api.client'
// import { useAppDispatch } from '@/shared/store'
// import { setPlacement } from '@/entities/app'

// export function useInitBitrix(inBitrix: boolean) {
//   const dispatch = useAppDispatch()
//   const [initialized, setInitialized] = useState(false)

//   useEffect(() => {
//     if (!inBitrix) return
//     let ignore = false

//     const init = async () => {
//       const placement = await getPlacement()
//       if (!ignore) {
//         dispatch(setPlacement(placement))
//         setInitialized(true)
//       }
//     }

//     init()

//     return () => {
//       ignore = true
//     }
//   }, [inBitrix, dispatch])

//   return { initialized }
// }
