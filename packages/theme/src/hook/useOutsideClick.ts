import { useEffect } from 'react'

export const useOutsideClick = (ref: React.RefObject<HTMLElement | HTMLDivElement | null>, callback: () => void) => {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref &&ref.current && !ref.current.contains(event.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ref, callback])
}
