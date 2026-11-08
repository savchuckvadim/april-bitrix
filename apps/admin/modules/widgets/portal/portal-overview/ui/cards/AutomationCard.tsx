'use client';

import Link from 'next/link';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import { useLaunchStatus } from '@/modules/entities/ai-analytics-launch';
import { usePortalHooksReadiness } from '@/modules/entities/hooks';
import { hookCounts, launchCounts } from '../../lib/overview-view';

const STATE_TONE: Record<string, 'success' | 'warning' | 'info' | 'muted'> = {
    done: 'success',
    todo: 'warning',
    running: 'info',
    unknown: 'muted',
};
const STATE_LABEL: Record<string, string> = {
    done: 'готово',
    todo: 'сделать',
    running: 'идёт',
    unknown: '?',
};

/**
 * AI-аналитика ОП (чек-лист запуска: настройки, смарт, конвейер, прогноз,
 * переразбор, стоимость) и готовность хуков портала — с переходом в разделы.
 */
export const AutomationCard = ({ portalId, domain }: { portalId: number; domain: string }) => {
    const launch = useLaunchStatus(domain).data;
    const hooks = usePortalHooksReadiness(portalId).data?.hooks;
    const blocks = launch
        ? [
              { title: 'Настройки', state: launch.settings.state },
              { title: 'Смарт-процесс', state: launch.smart.state },
              { title: 'Конвейер', state: launch.pipeline.state },
              { title: 'Прогноз', state: launch.forecast.state },
              { title: 'Переразбор', state: launch.reanalysis.state },
              { title: 'Стоимость', state: launch.cost.state },
          ]
        : [];
    const ai = launchCounts(blocks);
    const hook = hooks ? hookCounts(hooks) : null;

    return (
        <SectionCard title="AI-аналитика и хуки" description="Что включено и что осталось сделать.">
            <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">AI-аналитика ОП</span>
                    {launch && (
                        <span className="text-xs text-muted-foreground">
                            готово {ai.done} из {blocks.length}
                        </span>
                    )}
                </div>
                {!launch && <p className="text-xs text-muted-foreground">Загрузка…</p>}
                <div className="flex flex-wrap gap-1.5">
                    {blocks.map(block => (
                        <ToneBadge key={block.title} tone={STATE_TONE[block.state] ?? 'muted'} size="sm">
                            {block.title}: {STATE_LABEL[block.state] ?? block.state}
                        </ToneBadge>
                    ))}
                </div>
                <Link href={`/portal/${portalId}/ai-settings`} className="inline-block text-sm text-primary hover:underline">
                    Настройки AI и запуск
                </Link>
            </div>
            <div className="mt-4 space-y-1 border-t pt-3">
                <span className="text-sm font-medium">Хуки и автоматика</span>
                {hook ? (
                    <div className="flex flex-wrap gap-1.5">
                        <ToneBadge tone="success" size="sm">готовы: {hook.ready}</ToneBadge>
                        <ToneBadge tone={hook.partial ? 'warning' : 'muted'} size="sm">частично: {hook.partial}</ToneBadge>
                        <ToneBadge tone="muted" size="sm">не настроены: {hook.notInstalled}</ToneBadge>
                        {hook.disabled > 0 && <ToneBadge tone="muted" size="sm">выключены: {hook.disabled}</ToneBadge>}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">Загрузка…</p>
                )}
                <Link href={`/portal/${portalId}/hooks`} className="inline-block text-sm text-primary hover:underline">
                    Хуки портала
                </Link>
            </div>
        </SectionCard>
    );
};
