import type { Metadata } from 'next';
import { isFromCallsList } from '@/modules/entities/calls-list/lib/calls-list-format';
import { CallLeadPageView, CallPageUnavailable } from '@/modules/widgets/call-page';
import { loadCallPage } from '../../../../_lib/call-page';
import { loadCallLead } from '../../../../_lib/call-page-lead';

// Личная страница с рабочими данными: не кэшируем и поисковикам не отдаём.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Разбор звонка',
    robots: { index: false, follow: false },
};

/**
 * Личная страница разбора руководителя (ссылка из раздела «Разборы
 * звонков», 7 дней): страница звонка и блок «Оценка руководителя». Данные
 * грузит сервер Next, сохранение и запись — через наши route handlers:
 * адрес бэкенда в браузере не виден.
 */
export default async function CallLeadPage({
    params,
    searchParams,
}: {
    params: Promise<{ token: string; lead: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [{ token, lead }, query] = await Promise.all([params, searchParams]);
    const [page, review] = await Promise.all([
        loadCallPage(token),
        loadCallLead(token, lead),
    ]);
    if (page.status !== 'ok') {
        return <CallPageUnavailable reason={page.status} />;
    }
    return (
        <CallLeadPageView
            data={page.data}
            audioSrc={`/api/call/${encodeURIComponent(token)}/audio`}
            token={token}
            lead={lead}
            review={review}
            backToList={isFromCallsList(query.from)}
        />
    );
}
