import type { Metadata } from 'next';
import { isFromCallsList } from '@/modules/entities/calls-list/lib/calls-list-format';
import {
    CallPageBackLink,
    CallPageUnavailable,
    CallPageView,
    CallPublicReviewHint,
} from '@/modules/widgets/call-page';
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
 * виден. Оценить разбор здесь нельзя — под шапкой подсказка, где это
 * сделать (оценивает руководитель по личной ссылке из отчёта KPI).
 */
export default async function CallPage({
    params,
    searchParams,
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const [{ token }, query] = await Promise.all([params, searchParams]);
    const result = await loadCallPage(token);
    if (result.status !== 'ok') {
        return <CallPageUnavailable reason={result.status} />;
    }
    return (
        <CallPageView
            data={result.data}
            audioSrc={`/api/call/${encodeURIComponent(token)}/audio`}
            topBar={isFromCallsList(query.from) ? <CallPageBackLink /> : undefined}
            belowHeader={<CallPublicReviewHint />}
        />
    );
}
