import React from 'react';
import { Button } from '@workspace/ui/components/button';
import { Flame } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { CompanyColorBadge, companyColorLabel } from '@/modules/shared';
import type { FinanceHotThreshold } from '@/modules/entities/finance';
import {
    HOT_THRESHOLDS,
    OFFER_OPTIONS,
    OfferFilter,
    PERSPECTIVE_ALL,
    STAGE_ALL,
} from '../../lib/hot-clients.data';
import {
    dealStageToken,
    thresholdButtonClass,
    THRESHOLD_TOKEN,
} from '../../lib/deal-stage-colors';

interface HotClientsFiltersProps {
    threshold: FinanceHotThreshold;
    onThresholdChange: (value: FinanceHotThreshold) => void;
    stages: { code: string; name: string }[];
    stage: string;
    onStageAll: () => void;
    onStageToggle: (code: string) => void;
    perspectiveColors: string[];
    perspective: string;
    onPerspectiveAll: () => void;
    onPerspectiveSelect: (color: string) => void;
    offer: OfferFilter;
    onOfferChange: (value: OfferFilter) => void;
    filterActive: boolean;
    visibleCount: number;
    baseCount: number;
}

/** Панель фильтров горячих клиентов: порог, стадия, перспектива, предложение. */
export const HotClientsFilters: React.FC<HotClientsFiltersProps> = ({
    threshold,
    onThresholdChange,
    stages,
    stage,
    onStageAll,
    onStageToggle,
    perspectiveColors,
    perspective,
    onPerspectiveAll,
    onPerspectiveSelect,
    offer,
    onOfferChange,
    filterActive,
    visibleCount,
    baseCount,
}) => (
    <>
        {/* Порог воронки (глобальный — влияет на серверный запрос). */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
            <Flame className="h-4 w-4 text-finance-hot" />
            {HOT_THRESHOLDS.map(item => (
                <Button
                    key={item.value}
                    variant="outline"
                    className={cn(
                        'h-6 px-2 text-xs',
                        thresholdButtonClass(
                            THRESHOLD_TOKEN[item.value]!,
                            threshold === item.value,
                        ),
                    )}
                    onClick={() => onThresholdChange(item.value)}
                >
                    {item.label}
                </Button>
            ))}
        </div>

        {/* Стадия (чипы встреченных стадий, цвет — токен стадии). */}
        {stages.length > 1 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Стадия:</span>
                <Button
                    variant={stage === STAGE_ALL ? 'default' : 'outline'}
                    className="h-6 px-2 text-xs"
                    onClick={onStageAll}
                >
                    Все
                </Button>
                {stages.map(item => {
                    const token = dealStageToken(item.code);
                    const active = stage === item.code;
                    return (
                        <Button
                            key={item.code}
                            variant="outline"
                            className={cn(
                                'h-6 px-2 text-xs',
                                token
                                    ? thresholdButtonClass(token, active)
                                    : active
                                      ? 'bg-muted'
                                      : '',
                            )}
                            onClick={() => onStageToggle(item.code)}
                        >
                            {item.name}
                        </Button>
                    );
                })}
            </div>
        )}

        {/* Перспектива компании (цветовой светофор). */}
        {perspectiveColors.length > 0 && (
            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">Перспектива:</span>
                <Button
                    variant={
                        perspective === PERSPECTIVE_ALL ? 'default' : 'outline'
                    }
                    className="h-6 px-2 text-xs"
                    onClick={onPerspectiveAll}
                >
                    Все
                </Button>
                {perspectiveColors.map(color => (
                    <Button
                        key={color}
                        variant={perspective === color ? 'default' : 'outline'}
                        className="h-6 gap-1.5 px-2 text-xs"
                        onClick={() => onPerspectiveSelect(color)}
                        title={companyColorLabel(color)}
                    >
                        <CompanyColorBadge color={color} />
                        {companyColorLabel(color)}
                    </Button>
                ))}
            </div>
        )}

        {/* С/без предложения (есть сумма товарных строк или нет). */}
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Предложение:</span>
            {OFFER_OPTIONS.map(item => (
                <Button
                    key={item.value}
                    variant={offer === item.value ? 'default' : 'outline'}
                    className="h-6 px-2 text-xs"
                    onClick={() => onOfferChange(item.value)}
                >
                    {item.label}
                </Button>
            ))}
            {filterActive && (
                <span className="text-muted-foreground">
                    показано {visibleCount} из {baseCount}
                </span>
            )}
        </div>
    </>
);
