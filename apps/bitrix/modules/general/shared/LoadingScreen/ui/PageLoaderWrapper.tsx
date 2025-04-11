'use client'

import { PageLoader } from './PageLoader'
import { usePageLoad } from '../hooks/usePageLoad'

export function PageLoaderWrapper() {
    const { loading } = usePageLoad()
    return <PageLoader visible={loading} />
}
