'use client';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    COMPLECT_MODE,
    COMPLECT_MODE_NOTE,
    COMPLECT_MODE_ORDER,
    COMPLECT_MODE_TITLE,
    COMPLECT_OFFER_INFOBLOCKS,
    COMPLECT_OFFER_INFOBLOCKS_TITLE,
    type ComplectMode,
    type ComplectOfferInfoblocks,
} from '@/modules/entities/complect-variant';
import type { ComplectVariantsState } from '../hooks/use-complect-variants';

export interface ComplectVariantSettingsProps {
    variants: ComplectVariantsState;
}

/**
 * Какие варианты идут в документы: по одному (открытый вариант) или вместе
 * (одним договором либо разными), плюс инфоблоки КП для режимов «вместе».
 * Панель показывает блок, когда вариантов больше одного. Под выбором одна
 * строка о том, что уходит в документы в выбранном режиме.
 */
export const ComplectVariantSettings = ({ variants }: ComplectVariantSettingsProps) => {
    const { composition, isBusy, isTogether, singleContractAllowed } = variants;

    return (
        <div className="mt-1 flex flex-col gap-2 border-t pt-2">
            <label className="flex flex-wrap items-center gap-2 text-sm">
                Варианты в документах:
                <Select
                    value={composition.mode}
                    disabled={isBusy}
                    onValueChange={value =>
                        void variants.saveComposition({
                            mode: value as ComplectMode,
                        })
                    }
                >
                    <SelectTrigger size="sm" className="w-80 max-w-full" aria-label="Варианты в документах">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {COMPLECT_MODE_ORDER.map(mode => (
                            <SelectItem
                                key={mode}
                                value={mode}
                                disabled={
                                    mode === COMPLECT_MODE.single_contract &&
                                    !singleContractAllowed
                                }
                            >
                                {COMPLECT_MODE_TITLE[mode]}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </label>

            {!singleContractAllowed ? (
                <span className="text-xs text-muted-foreground">
                    «Одним договором» недоступно: у наборов разные типы
                    договора. Приведите их к одному типу или оставьте
                    разные договоры.
                </span>
            ) : null}
            {composition.mode === COMPLECT_MODE.single_contract &&
            !singleContractAllowed ? (
                <span className="text-xs text-destructive">
                    Выбран один договор, но типы договора у наборов
                    разошлись — выберите режим заново.
                </span>
            ) : null}

            {isTogether ? (
                <label className="flex flex-wrap items-center gap-2 text-sm">
                    Инфоблоки в КП:
                    <Select
                        value={composition.offer.infoblocks}
                        disabled={isBusy}
                        onValueChange={value =>
                            void variants.saveComposition({
                                offer: {
                                    ...composition.offer,
                                    infoblocks: value as ComplectOfferInfoblocks,
                                },
                            })
                        }
                    >
                        <SelectTrigger size="sm" className="w-56" aria-label="Инфоблоки в КП">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(COMPLECT_OFFER_INFOBLOCKS).map(value => (
                                <SelectItem key={value} value={value}>
                                    {COMPLECT_OFFER_INFOBLOCKS_TITLE[value]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </label>
            ) : null}

            <span className="text-xs text-muted-foreground">
                {COMPLECT_MODE_NOTE[composition.mode]}
            </span>
        </div>
    );
};
