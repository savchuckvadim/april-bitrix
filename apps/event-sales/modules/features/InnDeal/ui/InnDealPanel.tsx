'use client';

import { FC } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { SectionState } from '@/modules/shared/SectionState';
import { useInnDeal } from '../lib/hooks/use-inn-deal';
import { InnCandidateList } from './InnCandidateList';
import { InnConflictList } from './InnConflictList';
import { InnCurrentBlock } from './InnCurrentBlock';
import { InnManualForm } from './InnManualForm';
import { InnRequisiteList } from './InnRequisiteList';

/**
 * Вкладка «ИНН» карточки сделки.
 *
 * Истина — пара «договор ↔ плательщик»: у клиента бывают две пары
 * реквизитов (физлицо и ООО), на каждую свой договор и своя сделка. Поэтому
 * выбор делается ЗДЕСЬ, на сделке, а не в карточке компании.
 *
 * Запись идёт единственным писателем на бэке: фронт отправляет выбор вместе
 * с версией снимка и получает назад уже обновлённую карточку. Значит
 * гонка с роботом или соседней вкладкой заканчивается понятным сообщением,
 * а не тихой потерей чужого выбора.
 */
export const InnDealPanel: FC = () => {
    const panel = useInnDeal();

    if (panel.isSilent) return null;

    const snapshot = panel.snapshot;
    const current = snapshot?.current ?? null;

    return (
        <SectionCard
            title="ИНН договора"
            description={
                panel.readOnly
                    ? 'Сделка закрыта — только просмотр'
                    : 'Кто платит по этому договору'
            }
            tone={current ? 'neutral' : 'destructive'}
            accent={!current}
            density="compact"
            collapsible
            defaultOpen
            actions={
                <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Обновить данные по ИНН"
                    className="cursor-pointer"
                    disabled={panel.status === 'loading'}
                    onClick={panel.refetch}
                >
                    <RefreshCw className="size-4" />
                </Button>
            }
        >
            <SectionState
                status={panel.status}
                isEmpty={!snapshot}
                emptyText="Данных по ИНН нет: сделка не прочиталась."
                onRetry={panel.refetch}
            >
                {snapshot && (
                    <div className="space-y-3">
                        <InnCurrentBlock current={current} />

                        <InnConflictList conflicts={snapshot.conflicts} />

                        <section className="space-y-1.5">
                            <p className="text-xs font-semibold">
                                Варианты ИНН
                            </p>
                            <InnCandidateList
                                candidates={panel.candidates}
                                current={current?.inn ?? ''}
                                disabled={panel.isSaving}
                                readOnly={panel.readOnly}
                                onChoose={panel.choose}
                                onHide={panel.hide}
                            />
                            {!panel.readOnly && (
                                <InnManualForm
                                    disabled={panel.isSaving}
                                    isSaving={panel.isSaving}
                                    onSubmit={panel.choose}
                                />
                            )}
                        </section>

                        {panel.hidden.length > 0 && (
                            <section className="space-y-1">
                                <p className="text-xs font-semibold text-muted-foreground">
                                    Скрытые варианты: {panel.hidden.length}
                                </p>
                                <ul className="space-y-1">
                                    {panel.hidden.map(candidate => (
                                        <li
                                            key={candidate.inn}
                                            className="flex items-center gap-2 text-xs text-muted-foreground"
                                        >
                                            <span className="font-mono">
                                                {candidate.inn}
                                            </span>
                                            <span>{candidate.label}</span>
                                            {!panel.readOnly && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-6 gap-1 px-1.5"
                                                    disabled={panel.isSaving}
                                                    onClick={() =>
                                                        panel.restore(
                                                            candidate.inn,
                                                        )
                                                    }
                                                >
                                                    <Eye
                                                        aria-hidden
                                                        className="size-3.5"
                                                    />
                                                    вернуть
                                                </Button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="space-y-1.5">
                            <p className="text-xs font-semibold">
                                Реквизиты клиента
                            </p>
                            <InnRequisiteList
                                requisites={snapshot.requisites}
                                readable={
                                    snapshot.availability.requisitesReadable
                                }
                            />
                        </section>

                        {panel.error && (
                            <p className="text-xs text-destructive">
                                {panel.error}
                            </p>
                        )}

                        {snapshot.warnings.map(warning => (
                            <p
                                key={warning}
                                className="text-xs text-muted-foreground"
                            >
                                {warning}
                            </p>
                        ))}

                        {panel.readOnly && (
                            <ToneBadge tone="muted" variant="soft" size="sm">
                                закрытая сделка — только чтение
                            </ToneBadge>
                        )}
                    </div>
                )}
            </SectionState>
        </SectionCard>
    );
};

export default InnDealPanel;
