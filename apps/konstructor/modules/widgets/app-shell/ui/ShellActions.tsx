'use client';

import { House, Landmark, RefreshCcw, Settings } from 'lucide-react';
import { IconAction } from '@workspace/april-ui/actions';
import { ThemeTogglePanel } from '@workspace/theme';
import { useAppShell } from '../hooks/use-app-shell';

/**
 * Правый край шапки: «домой», служебные разделы, обновление, оформление.
 * Один угол на всё приложение — как в «Звонках».
 */
export const ShellActions = () => {
    const shell = useAppShell();

    return (
        <div className="ml-auto flex shrink-0 items-center gap-1">
            <IconAction
                icon={House}
                label="К сделке"
                hint="Варианты КП или документы сделки"
                onClick={shell.toHome}
                size="md"
                side="bottom"
            />
            <IconAction
                icon={Landmark}
                label="Реквизиты"
                hint="Реквизиты клиента для договора и счёта"
                pressed={shell.isRequisites}
                onClick={shell.toRequisites}
                size="md"
                side="bottom"
            />
            <IconAction
                icon={Settings}
                label="Настройки"
                hint="Шаблоны документов"
                pressed={shell.isSettings}
                onClick={shell.toSettings}
                size="md"
                side="bottom"
            />
            <IconAction
                icon={RefreshCcw}
                label="Обновить"
                hint="Перечитать сделку и каталог"
                disabled={shell.isReloading}
                onClick={shell.reload}
                size="md"
                side="bottom"
            />
            <ThemeTogglePanel />
        </div>
    );
};
