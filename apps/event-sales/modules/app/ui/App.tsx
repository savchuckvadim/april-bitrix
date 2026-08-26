'use client';

import { useEffect, useState } from 'react';
import { cn } from '@workspace/ui/lib/utils';
import { BootPreloaderGate } from '@workspace/april-ui/feedback';
import { EntityHeader } from '@/modules/widgets/EntityBar';

import { useApp } from '../lib/hooks/app';
import { useAppSelector } from '../lib/hooks/redux';
import { useUiDensity } from '../lib/hooks/use-ui-density';
import { APP_SCROLL_CONTAINER_ID } from '../consts/app-scroll';
import { AppGuardScreen } from './AppGuardScreen';
import { store } from '../model/store';

export const App = ({ children }: { children: React.ReactNode }) => {
    const { initialized, isLoading, isClient } = useApp();
    const guard = useAppSelector(s => s.app.guard);
    // В самоподгоняемых встройках (DETAIL_TAB/TASK) экран течёт по контенту —
    // каркас не нужен; в остальных он держит общую шапку над скроллом.
    const { isSelfSized } = useUiDensity();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isClient) {
            if (isMounted) {
                if (typeof window !== 'undefined') {
                    (window as any).store = store;
                }
            }
        }
    }, [isMounted]);

    const isReady = isClient && initialized && !isLoading;

    /*
     * Экран загрузки ровно один — SSR boot-прелоадер из корневого layout.
     * Он же ждёт данные: гасим его не по факту гидратации, а по готовности
     * приложения. Раньше здесь стоял собственный LoadingScreen с другим
     * знаком (/logo/logo.svg), и на стыке было видно подмену прелоадера.
     *
     * Общая клиентская шапка (EntityHeader) стоит НАД роут-слотом: переходы
     * список ↔ дело меняют только содержимое ниже, шапка не пересоздаётся.
     * В не-самоподгоняемых встройках каркас flex h-svh: шапка закреплена,
     * скроллится только контент под ней (страничного скролла нет).
     */
    return (
        <div className={cn(!isSelfSized && 'flex h-svh flex-col')}>
            <BootPreloaderGate ready={isReady} />
            {isReady ? (
                guard ? (
                    // Гвард вместо приложения: чужая задача / битые привязки.
                    <AppGuardScreen guard={guard} />
                ) : (
                    <>
                        <EntityHeader />
                        <div
                            id={APP_SCROLL_CONTAINER_ID}
                            className={cn(
                                // scrollbar-gutter: место под скроллбар
                                // зарезервировано всегда — сворачивание
                                // раздутой карточки (дубли под планом) не
                                // дёргает весь экран исчезающим скроллом.
                                // Не поддерживается (старый Safari) или
                                // overlay-скролл — свойство просто no-op,
                                // фолбэк не нужен; постоянный overflow-y:
                                // scroll рисовал бы пустой жёлоб хуже.
                                // Только в каркасном режиме: в self-sized
                                // (fitWindow) контейнер не скроллится вовсе.
                                !isSelfSized &&
                                    'min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]',
                            )}
                        >
                            {children}
                        </div>
                    </>
                )
            ) : null}
        </div>
    );
};

export default App;
