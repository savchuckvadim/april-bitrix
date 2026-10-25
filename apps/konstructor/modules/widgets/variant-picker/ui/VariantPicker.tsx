'use client';

import { Files, Plus } from 'lucide-react';
import { ActionTile } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Button } from '@workspace/ui/components/button';
import { Screen, ScreenHeader } from '@/modules/shared';
import { useVariantPicker } from '../hooks/use-variant-picker';

/** Варианты КП сделки: с каким работать или начать новый. */
export const VariantPicker = () => {
    const picker = useVariantPicker();

    return (
        <Screen>
            <ScreenHeader
                title="Варианты КП"
                description={`У сделки вариантов: ${picker.items.length}. Выберите, с каким работать, или начните новый.`}
                actions={
                    <>
                        {picker.hasCurrentBuild ? (
                            <Button
                                variant="outline"
                                onClick={picker.continueCurrent}
                            >
                                Последняя сборка сделки
                            </Button>
                        ) : null}
                        <Button onClick={picker.startNew} disabled={picker.isBusy}>
                            <Plus aria-hidden />
                            Новый вариант
                        </Button>
                    </>
                }
            />
            {picker.error ? (
                <p className="text-sm text-destructive">{picker.error}</p>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {picker.items.map(item => (
                    <ActionTile
                        key={item.key}
                        icon={Files}
                        title={item.title}
                        description={item.isOpen ? 'Открыт сейчас' : undefined}
                        selected={item.isOpen}
                        disabled={picker.isBusy}
                        badge={
                            <ToneBadge tone={item.stageTone} variant="soft">
                                {item.stageTitle}
                            </ToneBadge>
                        }
                        onClick={() => picker.open(item.record)}
                    />
                ))}
            </div>
        </Screen>
    );
};
