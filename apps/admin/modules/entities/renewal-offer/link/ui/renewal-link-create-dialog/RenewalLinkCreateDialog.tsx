'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { RENEWAL_LINK_PERIOD_OPTIONS } from '../../consts/renewal-link.consts';
import { formatRub } from '../../lib/renewal-link-view';
import { useCreateRenewalLink } from '../../lib/hooks';
import { OfferExtras } from './components/OfferExtras';
import { OfferField } from './components/OfferField';
import { OfferServiceBlock } from './components/OfferServiceBlock';
import {
    calcAiPrice,
    fieldsToCreateDto,
    useRenewalOfferForm,
} from './hooks/use-renewal-offer-form';

interface RenewalLinkCreateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Выдача персональной ссылки: состав услуг, цены этого клиента и срок.
 * Итоговая сумма считается здесь же — её видно до создания ссылки.
 */
export function RenewalLinkCreateDialog({
    open,
    onOpenChange,
}: RenewalLinkCreateDialogProps) {
    const form = useRenewalOfferForm();
    const create = useCreateRenewalLink();

    const submit = async (): Promise<void> => {
        await create.mutateAsync(fieldsToCreateDto(form.fields));
        form.reset();
        onOpenChange(false);
    };

    const { fields, set } = form;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Новое предложение клиенту</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="renewal-client">
                                Название клиента
                            </Label>
                            <Input
                                id="renewal-client"
                                placeholder="ООО Ромашка"
                                maxLength={255}
                                value={fields.clientName}
                                onChange={event =>
                                    set('clientName', event.target.value)
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Увидит клиент в заголовке предложения
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="renewal-period">
                                Срок действия ссылки
                            </Label>
                            <Select
                                value={fields.period}
                                onValueChange={value => set('period', value)}
                            >
                                <SelectTrigger id="renewal-period">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {RENEWAL_LINK_PERIOD_OPTIONS.map(option => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <OfferServiceBlock
                        id="renewal-sales"
                        title="Приложения по продажам"
                        priceNote={
                            fields.salesIncluded
                                ? `${formatRub(Number(fields.salesPrice) || 0)} / мес`
                                : undefined
                        }
                        included={fields.salesIncluded}
                        onToggle={value => set('salesIncluded', value)}
                    >
                        <OfferField
                            id="renewal-sales-price"
                            label="Цена пакета"
                            suffix="₽"
                            value={fields.salesPrice}
                            onChange={value => set('salesPrice', value)}
                            disabled={!fields.salesIncluded}
                            hint="Звонки, Конструктор КП и Отчёт KPI — одной ценой"
                        />
                    </OfferServiceBlock>

                    <OfferServiceBlock
                        id="renewal-ai"
                        title="AI-сервис"
                        priceNote={
                            fields.aiIncluded
                                ? `${formatRub(calcAiPrice(fields))} / мес`
                                : undefined
                        }
                        included={fields.aiIncluded}
                        onToggle={value => set('aiIncluded', value)}
                    >
                        <div className="grid gap-3 sm:grid-cols-3">
                            <OfferField
                                id="renewal-ai-employees"
                                label="Сотрудников"
                                suffix="чел."
                                value={fields.aiEmployees}
                                onChange={value => set('aiEmployees', value)}
                                disabled={!fields.aiIncluded}
                            />
                            <OfferField
                                id="renewal-ai-base"
                                label="Базовая цена"
                                suffix="₽"
                                value={fields.aiBasePrice}
                                onChange={value => set('aiBasePrice', value)}
                                disabled={!fields.aiIncluded}
                            />
                            <OfferField
                                id="renewal-ai-base-for"
                                label="Входит человек"
                                suffix="чел."
                                value={fields.aiBaseEmployees}
                                onChange={value =>
                                    set('aiBaseEmployees', value)
                                }
                                disabled={!fields.aiIncluded}
                            />
                            <OfferField
                                id="renewal-ai-extra"
                                label="За следующего"
                                suffix="₽"
                                value={fields.aiExtraPrice}
                                onChange={value => set('aiExtraPrice', value)}
                                disabled={!fields.aiIncluded}
                            />
                            <OfferField
                                id="renewal-ai-free"
                                label="Коридор ±"
                                suffix="чел."
                                value={fields.aiFreeDelta}
                                onChange={value => set('aiFreeDelta', value)}
                                disabled={!fields.aiIncluded}
                                hint="Менять состав без пересчёта цены"
                            />
                        </div>
                    </OfferServiceBlock>

                    <OfferServiceBlock
                        id="renewal-manager"
                        title="Персональный менеджер"
                        priceNote={
                            fields.managerIncluded
                                ? `${formatRub(Number(fields.managerPrice) || 0)} / мес`
                                : undefined
                        }
                        included={fields.managerIncluded}
                        onToggle={value => set('managerIncluded', value)}
                    >
                        <OfferField
                            id="renewal-manager-price"
                            label="Цена услуги"
                            suffix="₽"
                            value={fields.managerPrice}
                            onChange={value => set('managerPrice', value)}
                            disabled={!fields.managerIncluded}
                        />
                    </OfferServiceBlock>

                    <OfferServiceBlock
                        id="renewal-dev"
                        title="Разработка"
                        included={fields.devIncluded}
                        onToggle={value => set('devIncluded', value)}
                    >
                        <div className="grid gap-3 sm:grid-cols-2">
                            <OfferField
                                id="renewal-dev-hours"
                                label="Часов в пакете"
                                suffix="ч"
                                value={fields.devHours}
                                onChange={value => set('devHours', value)}
                                disabled={!fields.devIncluded}
                            />
                            <OfferField
                                id="renewal-dev-hour"
                                label="Цена часа сверх"
                                suffix="₽"
                                value={fields.devHourPrice}
                                onChange={value => set('devHourPrice', value)}
                                disabled={!fields.devIncluded}
                            />
                        </div>
                    </OfferServiceBlock>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <OfferField
                            id="renewal-adjustment"
                            label="Скидка или надбавка"
                            suffix="₽"
                            value={fields.adjustment}
                            onChange={value => set('adjustment', value)}
                            hint="Со знаком минус — скидка"
                        />
                        <OfferField
                            id="renewal-adjustment-label"
                            label="Подпись"
                            type="text"
                            value={fields.adjustmentLabel}
                            onChange={value => set('adjustmentLabel', value)}
                            placeholder="Скидка за год вперёд"
                        />
                    </div>

                    <OfferExtras
                        extras={fields.extras}
                        onAdd={form.addExtra}
                        onUpdate={form.updateExtra}
                        onRemove={form.removeExtra}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="renewal-title">
                            Пометка о выдаче (необязательно)
                        </Label>
                        <Input
                            id="renewal-title"
                            placeholder="Продление, отправлено 02.11"
                            maxLength={255}
                            value={fields.title}
                            onChange={event => set('title', event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                            Только для нас, клиент её не видит
                        </p>
                    </div>

                    <div className="flex items-baseline justify-between rounded-lg border border-border bg-muted/40 p-3">
                        <div className="text-sm text-muted-foreground">
                            Клиент увидит
                            {form.onceTotal !== 0 ? (
                                <span className="block text-xs">
                                    плюс разово {formatRub(form.onceTotal)}
                                </span>
                            ) : null}
                        </div>
                        <div className="text-xl font-semibold text-foreground">
                            {formatRub(form.monthlyTotal)}
                            <span className="ml-1 text-sm font-normal text-muted-foreground">
                                в месяц
                            </span>
                        </div>
                    </div>

                    {create.isError ? (
                        <p className="text-sm text-destructive">
                            Не удалось создать ссылку. Попробуйте ещё раз.
                        </p>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Отмена
                    </Button>
                    <Button
                        disabled={!form.canSubmit || create.isPending}
                        onClick={() => void submit()}
                    >
                        {create.isPending ? 'Создаю…' : 'Создать ссылку'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
