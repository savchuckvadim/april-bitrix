'use client';

import { Check, Files, Pencil, RotateCcw, X } from 'lucide-react';
import { Spinner } from '@workspace/april-ui/feedback';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { ContractDealFieldInput, useContractDealFields } from '@/modules/features/contract-form';
import { useZakupki, ZAKUPKI_DEAL_FIELDS } from '../hooks/use-zakupki';
import { ZakupkiProviderColumn } from './ZakupkiProviderColumn';

/**
 * «3 КП для торгов» (легаси OfferZakupkiMenu): наше КП плюс два от
 * вымышленных поставщиков с коэффициентами цены. Настройки — свои или
 * портальные; генерация уходит в очередь, документы — в сделку.
 */
export const ZakupkiCard = () => {
    const zakupki = useZakupki();
    const dates = useContractDealFields(ZAKUPKI_DEAL_FIELDS);

    return (
        <SectionCard
            title="3 КП для торгов"
            description="Три предложения одним пакетом: наше и два от других поставщиков с наценкой."
            tone="complect"
            actions={
                zakupki.settings ? (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline">{zakupki.settings.isFromUser ? 'мои настройки' : 'настройки портала'}</Badge>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => zakupki.setEditing(!zakupki.isEditing)}
                            disabled={zakupki.isSaving}
                        >
                            {zakupki.isEditing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                            {zakupki.isEditing ? 'Отмена' : 'Изменить'}
                        </Button>
                    </div>
                ) : null
            }
            state={zakupki.error || zakupki.saveError ? 'error' : undefined}
            message={zakupki.error ?? zakupki.saveError}
        >
            {zakupki.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Spinner size="sm" />
                    Загружаю настройки поставщиков…
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <ZakupkiProviderColumn
                            title="Поставщик 1"
                            fields={zakupki.providers.provider1}
                            isEditing={zakupki.isEditing}
                            onChange={zakupki.setValue}
                        />
                        <ZakupkiProviderColumn
                            title="Поставщик 2"
                            fields={zakupki.providers.provider2}
                            isEditing={zakupki.isEditing}
                            onChange={zakupki.setValue}
                        />
                    </div>
                    {zakupki.isEditing ? (
                        <div className="flex flex-wrap justify-end gap-2">
                            {zakupki.settings?.isFromUser ? (
                                <Button variant="ghost" size="sm" onClick={() => void zakupki.resetToPortal()} disabled={zakupki.isSaving}>
                                    <RotateCcw className="h-4 w-4" />К портальным
                                </Button>
                            ) : null}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void zakupki.saveForPortal()}
                                disabled={zakupki.isSaving || !zakupki.hasDraft}
                            >
                                Сохранить для портала
                            </Button>
                            <Button size="sm" onClick={() => void zakupki.saveForUser()} disabled={zakupki.isSaving || !zakupki.hasDraft}>
                                {zakupki.isSaving ? 'Сохраняю…' : 'Сохранить себе'}
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {dates.fields.map(field => (
                                    <ContractDealFieldInput
                                        key={field.code}
                                        id={`zakupki-${field.code}`}
                                        label={field.label}
                                        type={field.type}
                                        value={field.value}
                                        required
                                        saving={dates.savingField === field.code}
                                        onChange={value => dates.setValue(field.code, value)}
                                        onBlur={() => dates.save(field.code)}
                                    />
                                ))}
                            </div>
                            <div className="flex flex-col gap-1">
                                <Button
                                    variant="outline"
                                    onClick={() => void zakupki.run()}
                                    disabled={Boolean(zakupki.blocker) || zakupki.isGenerating}
                                >
                                    {zakupki.isDone ? <Check className="h-4 w-4" /> : <Files className="h-4 w-4" />}
                                    {zakupki.isGenerating ? 'Формирую…' : 'Сформировать 3 КП'}
                                </Button>
                                {zakupki.blocker ? <p className="text-xs text-muted-foreground">{zakupki.blocker}</p> : null}
                                {zakupki.generateError ? <p className="text-xs text-destructive">{zakupki.generateError}</p> : null}
                                {zakupki.isDone ? (
                                    <p className="text-xs text-muted-foreground">
                                        Три КП формируются и появятся в сделке.
                                    </p>
                                ) : null}
                            </div>
                        </>
                    )}
                </div>
            )}
        </SectionCard>
    );
};
