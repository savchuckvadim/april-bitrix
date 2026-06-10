import { useAppSelector } from "@/modules/app"

export const useProfComplects = () => {
    const { prof, loading } = useAppSelector(state => state.complect)
    const isLoading = loading === 'pending'
    return { prof, isLoading }
}
