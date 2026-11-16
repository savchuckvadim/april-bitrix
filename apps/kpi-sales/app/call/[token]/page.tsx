import type { Metadata } from 'next';
import { CallPageUnavailable, CallPageView } from '@/modules/widgets/call-page';
import { loadCallPage } from '../../_lib/call-page';

// Страница с рабочими данными: не кэшируем и поисковикам не отдаём.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: 'Разбор звонка',
    robots: { index: false, follow: false },
};

/**
 * Страница разбора звонка по ссылке (без входа). Данные грузит сервер Next,
 * запись идёт через /api/call/[token]/audio — адрес бэкенда в браузере не
 * виден.
 */
export default async function CallPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const result = await loadCallPage(token);
    if (result.status !== 'ok') {
        return <CallPageUnavailable reason={result.status} />;
    }
    return (
        <CallPageView
            data={result.data}
            audioSrc={`/api/call/${encodeURIComponent(token)}/audio`}
        />
    );
}
