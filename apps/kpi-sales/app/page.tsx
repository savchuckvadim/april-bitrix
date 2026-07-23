import { redirect } from 'next/navigation';

/** Реальная точка входа приложения — отчёт. */
export default function Page() {
    redirect('/report');
}
