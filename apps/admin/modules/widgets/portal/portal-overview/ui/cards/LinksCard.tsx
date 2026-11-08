import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { grafanaLoadUrl, portalDevUrl, portalUrl } from '../../consts/overview.const';

interface LinkItem {
    title: string;
    href: string;
    external?: boolean;
}

/** Полезные переходы: портал в Битриксе, разделы админки по порталу, журналы. */
export const LinksCard = ({ portalId, domain }: { portalId: number; domain: string }) => {
    const grafana = grafanaLoadUrl(domain);
    const groups: Array<{ title: string; items: LinkItem[] }> = [
        {
            title: 'Портал в Битрикс24',
            items: [
                { title: 'Открыть портал', href: portalUrl(domain), external: true },
                { title: 'Разработчикам (приложения, вебхуки)', href: portalDevUrl(domain), external: true },
                { title: 'Контакт-центр', href: `https://${domain}/contact_center/`, external: true },
            ],
        },
        {
            title: 'Портал в админке',
            items: [
                { title: 'Кабинет клиента', href: `/portal/${portalId}/cabinet` },
                { title: 'Настройки приложений', href: `/portal/${portalId}/app-settings` },
                { title: 'Ключи', href: `/portal/${portalId}/keys` },
                { title: 'Настройки AI', href: `/portal/${portalId}/ai-settings` },
                { title: 'Хуки', href: `/portal/${portalId}/hooks` },
                { title: 'Статистика транскрибации', href: `/portal/${portalId}/statistics/transcription` },
                { title: 'Суперпользователи April', href: `/portal/${portalId}/vendor-super-users` },
            ],
        },
        {
            title: 'Наблюдение',
            items: [
                { title: 'Заявка и установка', href: `/marketplace/applications/${portalId}` },
                { title: 'Журнал событий приложения', href: '/marketplace/events' },
                { title: 'Журналы приложений', href: '/logs' },
                ...(grafana ? [{ title: 'Нагрузка на Битрикс (Grafana)', href: grafana, external: true }] : []),
                { title: 'Путеводитель «Кабинет клиента»', href: '/marketplace/cabinet-guide' },
            ],
        },
    ];

    return (
        <SectionCard title="Полезные ссылки">
            <div className="grid gap-4 md:grid-cols-3">
                {groups.map(group => (
                    <div key={group.title} className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{group.title}</p>
                        <ul className="space-y-1">
                            {group.items.map(item => (
                                <li key={item.href}>
                                    {item.external ? (
                                        <a href={item.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                                            {item.title} <ExternalLink className="size-3" />
                                        </a>
                                    ) : (
                                        <Link href={item.href} className="text-sm text-primary hover:underline">
                                            {item.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </SectionCard>
    );
};
