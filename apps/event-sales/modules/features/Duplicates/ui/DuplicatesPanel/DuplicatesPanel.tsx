'use client';

import { FC } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { PreloaderMicro, ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { useDuplicatesPanel } from '../../lib/hooks';
import { DuplicateCard } from '../DuplicateCard/DuplicateCard';
import { DuplicateDetailsDialog } from '../DuplicateDetailsDialog/DuplicateDetailsDialog';

/**
 * Лента «Сигналы» в правой колонке отчёта.
 *
 * Поиск запускается сам при открытии приложения, поэтому менеджер видит
 * предупреждение до того, как начал работать с клиентом. В свёрнутом виде —
 * кто и почему похож; подробности по клику, чтобы узкая колонка не
 * превращалась в простыню.
 *
 * Ручного ввода здесь больше нет (убран 13.08.2026): телефон, почту и ИНН
 * заводят в саму сущность — оттуда поиск стартует сам, а «Искать глубже»
 * добирает остальное. Отдельная форма поверх этого только путала.
 */
export const DuplicatesPanel: FC = () => {
    const panel = useDuplicatesPanel();

    return (
        <>
            <SectionCard
                title="Возможные пересечения"
                description={panel.targetLabel}
                tone={panel.hasCandidates ? 'warning' : 'neutral'}
                accent={panel.hasCandidates}
                density="compact"
                actions={
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Искать заново"
                            className="cursor-pointer"
                            disabled={panel.isLoading}
                            onClick={panel.search}
                        >
                            <RefreshCw className="size-4" />
                        </Button>
                    </div>
                }
            >
                {panel.isLoading && (
                    <div className="flex items-center gap-2 py-1 text-xs text-muted-foreground">
                        <PreloaderMicro />
                        Ищем совпадения…
                    </div>
                )}

                {panel.showError && (
                    <div className="space-y-1.5">
                        <p className="text-xs text-destructive">
                            {panel.error}
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={panel.search}
                        >
                            Повторить
                        </Button>
                    </div>
                )}

                {!panel.isLoading &&
                    !panel.showError &&
                    panel.hasCandidates && (
                        <>
                            <ul className="space-y-1.5">
                                {panel.candidates.map(candidate => (
                                    <li
                                        key={`${candidate.entityType}_${candidate.id}`}
                                    >
                                        <DuplicateCard
                                            candidate={candidate}
                                            onOpen={panel.openDetails}
                                        />
                                    </li>
                                ))}
                            </ul>
                            <ToneBadge tone="muted" variant="soft" size="sm">
                                Найдено: {panel.candidates.length}
                            </ToneBadge>
                        </>
                    )}

                {!panel.isLoading &&
                    !panel.showError &&
                    !panel.hasCandidates && (
                        <div className="space-y-1.5">
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <ShieldCheck aria-hidden className="size-3.5" />
                                {panel.isSearched
                                    ? 'Дублей не нашлось.'
                                    : 'Проверка дублей ещё не запускалась.'}
                            </p>
                        </div>
                    )}
                {/* «Искать глубже» — второй уровень поиска, и он нужен и тогда,
                    когда что-то уже нашлось: первый уровень мог показать не всё.
                    Раньше кнопка жила внутри ветки «ничего не найдено» и
                    пропадала ровно там, где чаще всего нужна. */}
                {panel.canSearch ? (
                    <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={panel.isLoading}
                        onClick={panel.searchDeeper}
                    >
                        Искать глубже
                    </Button>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Искать не от чего: заполните ИНН, телефон или почту —
                        поиск запустится сам.
                    </p>
                )}
            </SectionCard>

            <DuplicateDetailsDialog />
        </>
    );
};
