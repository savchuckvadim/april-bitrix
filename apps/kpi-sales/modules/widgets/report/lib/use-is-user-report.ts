'use client';

import { usePathname } from 'next/navigation';

/** Страница отчёта по сотруднику — без «Поделиться»/«Скачать» и части фильтров. */
export const useIsUserReport = () => usePathname() === '/report/user';
