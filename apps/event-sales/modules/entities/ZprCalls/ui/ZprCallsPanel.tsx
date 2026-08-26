'use client';

import { FC } from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { PreloaderMicro } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useZprCalls } from '../lib/hooks/use-zpr-calls';
import { ZprCallsList } from './ZprCallsList';

/**
 * Панель «Звонки по решению» в колонке карточки дела — рядом с блоком связей
 * (SectionCard в компактной плотности, как у DuplicatesPanel).
 *
 * Self-gate: ссылок op_zprs нет — панель молчит целиком (ни карточки, ни
 * запросов): ЗПР есть у меньшинства клиентов, пустая секция в узкой колонке
 * отчёта — шум.
 */
export const ZprCallsPanel: FC = () => {
    const calls = useZprCalls();
    if (calls.isSilent) return null;

    return (
        <SectionCard
            title="Звонки по решению"
            tone={calls.open.length ? 'warning' : 'neutral'}
            accent={calls.open.length > 0}
            density="compact"
            collapsible
            defaultOpen
        >
            {calls.status === 'loading' && (
                <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                    <PreloaderMicro />
                    Читаем элементы смарта…
                </div>
            )}

            {calls.status === 'error' && (
                <div className="space-y-1.5">
                    <p className="text-xs text-destructive">
                        Элементы ЗПР не прочитались из смарта.
                    </p>
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={calls.refetch}
                    >
                        Повторить
                    </Button>
                </div>
            )}

            {calls.status === 'ready' && <ZprCallsList calls={calls} />}
        </SectionCard>
    );
};

export default ZprCallsPanel;
