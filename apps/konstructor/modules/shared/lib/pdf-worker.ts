import { pdfjs } from 'react-pdf';

/**
 * Воркер pdf.js для react-pdf — одна настройка на всё приложение (раньше
 * строка копировалась в каждый просмотрщик). Подключается побочным импортом:
 * `import '@/modules/shared/lib/pdf-worker'`.
 *
 * Модуль тянет react-pdf, а тот трогает DOM при импорте: импортировать только
 * из компонентов, которые грузятся через `next/dynamic` с `ssr: false`, и не
 * экспортировать из баррелей.
 */
if (typeof window !== 'undefined') {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.mjs`;
}
