'use client';

import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
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
    COMPLECT_VARIANT_STAGE,
    COMPLECT_VARIANT_STAGE_TITLE,
    type ComplectMode,
    type ComplectOfferInfoblocks,
} from '@/modules/entities/complect-variant';
import { useComplectVariants } from '../hooks/use-complect-variants';

/**
 * Варианты комплекта сделки: собрать несколько предложений, выбрать
 * участников (стадия элемента) и задать, как они лягут в КП. Мерджа здесь
 * нет — только выбор. Документы мультикомплектом пока не печатаются:
 * настройки сохраняются и переезжают в отдел сервиса.
 */
export const ComplectVariantPanel = () => {
    const variants = useComplectVariants();

    if (!variants.hasSmart) return null;

    const {
        records,
        openVariantSmartId,
        composition,
        isBusy,
        stageOf,
        titleOf,
        singleContractAllowed,
    } = variants;

    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-card p-3">
            <div className="flex flex-wrap items-center gap-2">
                <span className="mr-auto text-sm font-semibold">
                    Варианты комплекта
                </span>
                <Input
                    className="h-8 w-48 text-sm"
                    placeholder="Название варианта"
                    aria-label="Название варианта"
                    value={variants.newTitle}
                    disabled={isBusy}
                    onChange={event => variants.setNewTitle(event.target.value)}
                />
                <Button
                    size="sm"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() => void variants.create()}
                >
                    Сохранить как вариант
                </Button>
            </div>

            {variants.error ? (
                <span className="text-xs text-destructive">{variants.error}</span>
            ) : null}

            {!records.length ? (
                <span className="text-xs text-muted-foreground">
                    Вариантов пока нет. Соберите комплект и сохраните его как
                    вариант — потом можно будет собрать ещё и выбрать из них.
                </span>
            ) : null}

            {records.map(record => {
                const variantSmartId = record.variantSmartId;
                const stage = stageOf(variantSmartId);
                const isOpen =
                    variantSmartId !== null &&
                    variantSmartId === openVariantSmartId;
                const isRejected = stage === COMPLECT_VARIANT_STAGE.rejected;

                return (
                    <div
                        key={record.id}
                        className={`flex flex-wrap items-center gap-2 text-sm ${
                            isRejected ? 'opacity-50' : ''
                        }`}
                    >
                        <span className={isOpen ? 'font-semibold' : ''}>
                            {titleOf(record)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {COMPLECT_VARIANT_STAGE_TITLE[stage]}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={isBusy || isOpen}
                            onClick={() => void variants.open(record)}
                        >
                            {isOpen ? 'Открыт' : 'Открыть'}
                        </Button>
                        {isOpen ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() => void variants.close()}
                            >
                                Закрыть
                            </Button>
                        ) : null}
                        {variantSmartId !== null &&
                        stage !== COMPLECT_VARIANT_STAGE.current ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                disabled={isBusy}
                                onClick={() =>
                                    void variants.setStage(
                                        variantSmartId,
                                        COMPLECT_VARIANT_STAGE.current,
                                    )
                                }
                            >
                                Сделать текущим
                            </Button>
                        ) : null}
                        {variantSmartId !== null && !isRejected ? (
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                disabled={isBusy}
                                onClick={() =>
                                    void variants.setStage(
                                        variantSmartId,
                                        COMPLECT_VARIANT_STAGE.rejected,
                                    )
                                }
                            >
                                Отклонить
                            </Button>
                        ) : null}
                    </div>
                );
            })}

            {records.length > 1 ? (
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
            ) : null}
        </div>
    );
};
