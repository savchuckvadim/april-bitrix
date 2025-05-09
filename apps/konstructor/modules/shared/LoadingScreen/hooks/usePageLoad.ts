

'use client'

import { useEffect, useState } from 'react'

export function usePageLoad(externalReady = true) {
  const [domReady, setDomReady] = useState(false)

  useEffect(() => {
    const onLoad = () => setDomReady(true)

    if (document.readyState === 'complete') {
      setDomReady(true)
    } else {
      window.addEventListener('load', onLoad)
    }

    return () => window.removeEventListener('load', onLoad)
  }, [])

  const loading = !domReady || !externalReady
  return { loading }
}
