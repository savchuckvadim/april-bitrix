'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { useSupportGuide, useSupportOpenDialogs } from '@/modules/entities/support';
import { dialogsOfPortal, formatMinutes } from '../../lib/overview-view';
import { SupportStats } from './SupportStats';

/**
 * Обращения в линию поддержки April с этого портала (портал клиента
 * определяется по сайту пользователя Битрикс24-сети): статистика за период
 * по истории монитора ({@link SupportStats}) и что открыто прямо сейчас.
 */
export const SupportCard = ({ domain }: { domain: string }) => {
    const lineDomain = useSupportGuide().data?.lineDomain;
    const { data, isLoading, isError } = useSupportOpenDialogs(lineDomain);
    const dialogs = data ? dialogsOfPortal(data.dialogs, domain) : [];

    return (
        <SectionCard title="Поддержка" description="Обращения в линию April с этого портала.">
            <SupportStats domain={domain} />
            <p className="mb-1 mt-4 border-t pt-3 text-xs font-medium text-muted-foreground">Открыто сейчас</p>
            {(isLoading || !lineDomain) && <p className="text-sm text-muted-foreground">Загрузка…</p>}
            {isError && <p className="text-sm text-destructive">Линия поддержки не ответила</p>}
            {data && dialogs.length === 0 && (
                <p className="text-sm text-muted-foreground">Открытых обращений нет.</p>
            )}
            <ul className="space-y-2">
                {dialogs.map(dialog => (
                    <li key={dialog.sessionId} className="space-y-0.5 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <a href={dialog.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                {dialog.clientName} <ExternalLink className="size-3" />
                            </a>
                            <span className={dialog.waitedMinutes >= 30 ? 'text-xs text-destructive' : 'text-xs text-muted-foreground'}>
                                {dialog.waitedMinutes > 0 ? `ждёт ${formatMinutes(dialog.waitedMinutes)}` : 'ответили'}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {dialog.operatorName ? `оператор: ${dialog.operatorName}` : 'никто не взял'}
                            {dialog.pendingText ? ` · «${dialog.pendingText.slice(0, 100)}»` : ''}
                        </p>
                    </li>
                ))}
            </ul>
            <Link href="/support" className="mt-3 inline-block text-sm text-primary hover:underline">
                Раздел «Поддержка клиентов»
            </Link>
        </SectionCard>
    );
};
