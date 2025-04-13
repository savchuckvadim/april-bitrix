'use client'

import { useEffect } from 'react'

export const usePace = () => {
  useEffect(() => {
    const loadPace = async () => {
      if (typeof window === 'undefined') return;

      await import('pace-js') // ⬅️ динамически, только на клиенте
      // Опционально: настраиваем слушатели
      if (window.Pace) {
        window.Pace.on('start', () => {
          console.log('Pace started')
        })
        window.Pace.on('done', () => {
          console.log('Pace done')
        })
      }
    }

    loadPace()
  }, [])
}
