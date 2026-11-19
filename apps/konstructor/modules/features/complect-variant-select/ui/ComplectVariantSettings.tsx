'use client';

import { Checkbox } from '@workspace/ui/components/checkbox';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import {
    COMPLECT_MODE,
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
 * Как варианты лягут в КП: режим наборов, инфоблоки, наборы для сравнения.
 * Панель показывает блок, когда вариантов больше одного. Документы
 * мультикомплектом пока не печатаются: настройки сохраняются и переезжают в
 * отдел сервиса.
 */
export const ComplectVariantSettings = ({ variants }: ComplectVariantSettingsProps) => {
    const { composition, isBusy, singleContractAllowed } = variants;

    return (
        <div className="mt-1 flex flex-col gap-2 border-t pt-2">
            <label className="flex flex-wrap items-center gap-2 text-sm">
                Наборы идут:
                <Select
                    value={composition.mode}
                    disabled={isBusy}
                    onValueChange={value =>
                        void variants.saveComposition({
                            mode: value as ComplectMode,
                        })
                    }
                >
                    <SelectTrigger size="sm" className="w-56" aria-label="Режим наборов">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(COMPLECT_MODE).map(mode => (
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

            {composition.mode !== COMPLECT_MODE.compare ? (
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

            <Label className="flex items-center gap-2 text-sm font-normal">
                <Checkbox
                    checked={composition.offer.showAlternatives}
                    disabled={isBusy}
                    onCheckedChange={checked =>
                        void variants.saveComposition({
                            offer: {
                                ...composition.offer,
                                showAlternatives: checked === true,
                            },
                        })
                    }
                />
                Показать в КП наборы для сравнения
            </Label>

            <span className="text-xs text-muted-foreground">
                Документы пока собираются по одному набору: настройки
                сохраняются и переезжают в отдел сервиса, но КП, счёт
                и договор мультикомплектом ещё не печатаются.
            </span>
        </div>
    );
};
