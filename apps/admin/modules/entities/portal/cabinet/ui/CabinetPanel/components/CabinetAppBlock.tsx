'use client';

import Link from 'next/link';
import { ABadge, AButton } from '@workspace/april-ui';
import { useRefreshCabinetWidgets } from '../../../lib/hooks/use-cabinet';
import type { CabinetAppStatus } from '../../../model';

const AUTH_MODE_TITLE: Record<string, string> = {
    webhook: 'вебхук портала',
    app: 'токен приложения',
    auto: 'автоматически (приложение, если установлено)',
};

const WIDGET_TITLE: Record<string, string> = {
    'event-sales': 'Звонки (ОП)',
    konstructor: 'Конструктор КП',
    'report-sales': 'Отчёт ОП KPI',
    'event-service': 'Звонки (сервис)',
    'konstructor-service': 'Конструктор КП (сервис)',
    'report-service': 'Отчёт КЦ KPI',
};

interface CabinetAppBlockProps {
    portalId: number;
    app: CabinetAppStatus;
}

/**
 * Приложение April на портале: установлено ли, чем бэкенд ходит в портал,
 * какие виджеты должны стоять — и кнопки «Обновить» / «Переустановить».
 * Список виджетов и режим меняются во вкладке «Settings» портала, адреса
 * фронтов — в «Настройках приложения» (раздел «Виджеты»).
 */
export const CabinetAppBlock = ({ portalId, app }: CabinetAppBlockProps) => {
    const refresh = useRefreshCabinetWidgets(portalId);

    const reinstall = () => {
        if (
            !window.confirm(
                'Переустановить виджеты? Все наши привязки на портале будут сняты и поставлены заново по списку. Чужие приложения не трогаются.',
            )
        )
            return;
        refresh.mutate(true);
    };

    return (
        <div className="flex flex-col gap-2">
            <h4 className="text-sm font-medium">Приложение April на портале</h4>
            <div className="flex flex-wrap items-center gap-2 text-sm">
                <ABadge
                    title={app.installed ? 'установлено' : app.uninstalledAt ? 'удалено' : 'не установлено'}
                    size="small"
                    color={app.installed ? 'green' : 'grey'}
                />
                {app.installStatus && app.installStatus !== 'installed' && (
                    <ABadge title={`шаг: ${app.installStatus}`} size="small" color="warning" />
                )}
                <span className="text-muted-foreground">
                    Бэкенд ходит в портал: {AUTH_MODE_TITLE[app.bitrixAuthMode] ?? app.bitrixAuthMode}
                </span>
            </div>
            <p className="text-sm">
                Виджеты по списку:{' '}
                {app.widgets.length > 0 ? (
                    app.widgets.map(code => WIDGET_TITLE[code] ?? code).join(', ')
                ) : (
                    <span className="text-muted-foreground">
                        список пуст — привязки на портале не трогаются (так у действующих порталов)
                    </span>
                )}
            </p>
            <p className="text-xs text-muted-foreground">
                Список и режим — во{' '}
                <Link href={`/portal/${portalId}/app-settings`} className="text-primary hover:underline">
                    вкладке Settings
                </Link>{' '}
                («Приложение April на портале»); адреса фронтов —{' '}
                <Link href="/settings" className="text-primary hover:underline">
                    Настройки приложения → Виджеты
                </Link>{' '}
                (действуют сразу на всех порталах, переустановка не нужна).
            </p>
            <div className="flex flex-wrap gap-2">
                <div>
                    <AButton
                        title="Обновить виджеты"
                        size="small"
                        isActive={app.installed && !refresh.isPending}
                        clickHendler={() => refresh.mutate(false)}
                    />
                </div>
                <div>
                    <AButton
                        title="Переустановить виджеты"
                        size="small"
                        color="grey"
                        isActive={app.installed && !refresh.isPending}
                        clickHendler={reinstall}
                    />
                </div>
            </div>
        </div>
    );
};
