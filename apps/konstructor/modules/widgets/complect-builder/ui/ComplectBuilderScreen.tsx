'use client';

import { SlidersHorizontal } from 'lucide-react';
import { EmptyState } from '@workspace/april-ui/feedback';
import { ChoiceChips } from '@workspace/april-ui/fields';
import { Button } from '@workspace/ui/components/button';
import { BuildSummary } from '@/modules/features/build-summary';
import { CompositionEditorPanel } from '@/modules/features/composition-editor';
import { FlowSummary } from '@/modules/features/flow-summary';
import { MainSupplySelect } from '@/modules/features/main-supply-select';
import { Screen, ScreenSplit } from '@/modules/shared';
import { useComplectBuilder } from '../hooks/use-complect-builder';

/**
 * Шаг 2 (легаси KONSTRUCTOR): без заголовка экрана. В основной колонке сверху
 * комплекты чипами (шире наполнения под ними они не бывают, лишнее уходит на
 * вторую строку), ниже наполнение. В правой колонке сверху компактный селект
 * количества ОД главной строки (только вид доступа со старта), под ним «Назад»
 * и итог с переходом к ценам, как на шаге «Цены». Во всю ширину фрейма:
 * категорий наполнения много.
 */
export const ComplectBuilderScreen = () => {
    const builder = useComplectBuilder();

    if (!builder.mainRow) {
        return (
            <Screen width="narrow">
                <EmptyState
                    icon={SlidersHorizontal}
                    title="Сначала основные параметры"
                    description="Комплекты зависят от региона, линейки и вида доступа."
                    actions={
                        <Button onClick={builder.toParams}>К параметрам</Button>
                    }
                />
            </Screen>
        );
    }

    return (
        <Screen width="full">
            <ScreenSplit
                aside={
                    <>
                        <MainSupplySelect />
                        <FlowSummary title="Итог">
                            <BuildSummary />
                        </FlowSummary>
                    </>
                }
            >
                <ChoiceChips
                    options={builder.complectOptions}
                    value={builder.currentComplectCode}
                    onChange={builder.selectComplect}
                    ariaLabel="Комплект"
                    collapseBelow="md"
                />
                <CompositionEditorPanel row={builder.mainRow} />
            </ScreenSplit>
        </Screen>
    );
};
