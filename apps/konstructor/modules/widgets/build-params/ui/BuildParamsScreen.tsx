'use client';

import { SummaryFacts } from '@/modules/features/build-summary';
import { FlowSummary } from '@/modules/features/flow-summary';
import { Screen, ScreenHeader, ScreenSplit } from '@/modules/shared';
import { useBuildParams } from '../hooks/use-build-params';
import {
    COMPLECT_TYPE_OPTIONS,
    SUPPLY_KIND_OPTIONS,
} from '../lib/build-params-options';
import { ParamTiles } from './ParamTiles';
import { RegionField } from './RegionField';

/** Шаг 1: регион, линейка, вид доступа (легаси GLOBAL). */
export const BuildParamsScreen = () => {
    const params = useBuildParams();

    return (
        <Screen>
            <ScreenHeader
                title="Основные параметры"
                description="От них зависят доступные комплекты, поставки и цены."
            />
            <ScreenSplit
                aside={
                    <FlowSummary
                        title="Параметры"
                        onNext={params.apply}
                        nextDisabled={!params.canApply}
                        hint={
                            params.isUnavailable
                                ? 'Для этой линейки нет поставок выбранного вида доступа.'
                                : !params.draft.regionCode
                                  ? 'Выберите регион — от него зависят цены.'
                                  : null
                        }
                    >
                        <SummaryFacts facts={params.facts} />
                    </FlowSummary>
                }
            >
                <RegionField
                    regions={params.regions}
                    value={params.draft.regionCode}
                    onChange={params.setRegion}
                />
                <ParamTiles
                    title="Линейка"
                    options={COMPLECT_TYPE_OPTIONS}
                    value={params.draft.complectType}
                    onChange={params.setComplectType}
                />
                <ParamTiles
                    title="Вид доступа"
                    options={SUPPLY_KIND_OPTIONS}
                    value={params.draft.supplyKind}
                    onChange={params.setSupplyKind}
                />
            </ScreenSplit>
        </Screen>
    );
};
