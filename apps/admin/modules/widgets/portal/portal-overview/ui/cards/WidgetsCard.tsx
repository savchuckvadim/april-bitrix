'use client';

import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { useApplicationComponents } from '@/modules/entities/marketplace/applications';
import { useCabinetCard, WIDGET_TITLE } from '@/modules/entities/portal/cabinet';
import { widgetRows, type WidgetState } from '../../lib/overview-view';
import { LiveWidgetsCheck } from './LiveWidgetsCheck';

const STATE: Record<WidgetState, { label: string; tone: 'success' | 'destructive' | 'muted' }> = {
    installed: { label: 'привязан', tone: 'success' },
    error: { label: 'ошибка', tone: 'destructive' },
    missing: { label: 'не привязан', tone: 'muted' },
};

/**
 * Виджеты по списку портала (`app_widgets`) против последней синхронизации
 * привязок: где привязан, что с ошибкой; по кнопке — сверка с Битриксом
 * ({@link LiveWidgetsCheck}). Ставит и переставляет — вкладка «Кабинет» →
 * «Обновить виджеты».
 */
export const WidgetsCard = ({ portalId }: { portalId: number }) => {
    const app = useCabinetCard(portalId).data?.app;
    const components = useApplicationComponents(String(portalId)).data ?? [];
    const rows = app ? widgetRows(app.widgets, components, WIDGET_TITLE) : [];

    return (
        <SectionCard title="Виджеты" description="Список портала против последней синхронизации привязок в Битриксе.">
            {!app && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {app && rows.length === 0 && (
                <p className="text-sm text-muted-foreground">
                    Список виджетов пуст — действующие порталы работают на прежних виджетах до переезда.
                </p>
            )}
            <ul className="space-y-2">
                {rows.map(row => (
                    <li key={row.code} className="space-y-0.5 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span>{row.title}</span>
                            <ToneBadge tone={STATE[row.state].tone} size="sm">
                                {STATE[row.state].label}
                            </ToneBadge>
                        </div>
                        {row.places.length > 0 && (
                            <p className="text-xs text-muted-foreground">{row.places.join(', ')}</p>
                        )}
                        {row.detail && <p className="text-xs text-destructive">{row.detail}</p>}
                    </li>
                ))}
            </ul>
            {app && <LiveWidgetsCheck portalId={portalId} desired={app.widgets} titles={WIDGET_TITLE} />}
            <Link href={`/portal/${portalId}/cabinet`} className="mt-3 inline-block text-sm text-primary hover:underline">
                Обновить или переустановить — вкладка «Кабинет»
            </Link>
        </SectionCard>
    );
};
