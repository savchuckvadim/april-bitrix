'use client';

import { Loader2 } from 'lucide-react';
import { BlurCommitInput, BlurCommitTextarea, ChoiceChips } from '@workspace/april-ui/fields';
import { SectionCard } from '@workspace/april-ui/surfaces';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import {
    OFFER_PDF_DESCRIPTION_MODE_OPTIONS,
    OFFER_PDF_VIEW_MODE_OPTIONS,
    type OfferPdfDescriptionMode,
    type OfferPdfSettings,
    type OfferPdfViewMode,
} from '../model/types';
import { useOfferPdfDocument } from '../model/OfferPdfDocumentContext';

const SwitchRow = ({
    id,
    label,
    hint,
    checked,
    onChange,
}: {
    id: string;
    label: string;
    hint?: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) => (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-md border border-border/70 p-3">
        <Switch id={id} checked={checked} onCheckedChange={onChange} className="mt-0.5" />
        <span className="min-w-0">
            <span className="block text-sm font-medium">{label}</span>
            {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
        </span>
    </label>
);

/** Встроенный PDF-шаблон: выбор стиля, настройки документа и письмо. */
export const OfferPdfTemplateCard = () => {
    const {
        templates,
        templatesLoading,
        templatesError,
        templateCode,
        setTemplateCode,
        settings,
        setSettings,
        letter,
        setLetter,
        documentNumber,
        setDocumentNumber,
    } = useOfferPdfDocument();

    const selected = templates.find(template => template.code === templateCode) ?? null;
    const set = <K extends keyof OfferPdfSettings>(key: K, value: OfferPdfSettings[K]) => setSettings({ [key]: value });

    return (
        <>
            <SectionCard
                title="Шаблон и настройки"
                description="Стиль документа и что в нём печатать. Превью обновится само, текст — после выхода из поля."
                tone="complect"
            >
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        {templatesLoading ? (
                            <p className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                                Загружаем шаблоны…
                            </p>
                        ) : templatesError ? (
                            <p className="text-sm text-destructive">{templatesError}</p>
                        ) : (
                            <ChoiceChips
                                options={templates.map(template => ({ value: template.code, label: template.name }))}
                                value={templateCode}
                                onChange={setTemplateCode}
                                ariaLabel="Стиль шаблона"
                            />
                        )}
                        {selected ? <p className="text-xs text-muted-foreground">{selected.description}</p> : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="offer-pdf-description">Описание наполнения</Label>
                            <Select
                                value={settings.descriptionMode}
                                onValueChange={value => set('descriptionMode', value as OfferPdfDescriptionMode)}
                            >
                                <SelectTrigger id="offer-pdf-description">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OFFER_PDF_DESCRIPTION_MODE_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="offer-pdf-view">Вид наполнения</Label>
                            <Select value={settings.viewMode} onValueChange={value => set('viewMode', value as OfferPdfViewMode)}>
                                <SelectTrigger id="offer-pdf-view">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OFFER_PDF_VIEW_MODE_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3">
                        <SwitchRow
                            id="offer-pdf-stamps"
                            label="Подпись руководителя"
                            hint="Блок под письмом"
                            checked={settings.withStamps}
                            onChange={value => set('withStamps', value)}
                        />
                        <SwitchRow
                            id="offer-pdf-manager"
                            label="Контакты менеджера"
                            hint="В подвале каждой страницы"
                            checked={settings.withManager}
                            onChange={value => set('withManager', value)}
                        />
                        <SwitchRow
                            id="offer-pdf-price-first"
                            label="Сначала цена"
                            hint="Потом наполнение"
                            checked={settings.isPriceFirst}
                            onChange={value => set('isPriceFirst', value)}
                        />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="offer-pdf-sale-phrase">Фраза об акции</Label>
                            <BlurCommitInput
                                id="offer-pdf-sale-phrase"
                                value={settings.salePhrase}
                                onCommit={value => set('salePhrase', value)}
                                placeholder="Печатается под таблицей цен"
                                maxLength={500}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="offer-pdf-number">Исходящий номер</Label>
                            <BlurCommitInput
                                id="offer-pdf-number"
                                value={documentNumber}
                                onCommit={setDocumentNumber}
                                placeholder="Пусто — печатается только дата"
                                maxLength={50}
                            />
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                title="Сопроводительное письмо"
                description="Пустые поля шаблон заполнит сам: обращение по имени получателя и стандартный текст."
                tone="complect"
                density="compact"
                collapsible
                defaultOpen={Boolean(letter.appeal || letter.text)}
            >
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="offer-pdf-appeal">Обращение</Label>
                        <BlurCommitInput
                            id="offer-pdf-appeal"
                            value={letter.appeal}
                            onCommit={appeal => setLetter({ appeal })}
                            placeholder="Уважаемый Иван Иванович!"
                            maxLength={200}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="offer-pdf-letter">Текст письма</Label>
                        <BlurCommitTextarea
                            id="offer-pdf-letter"
                            value={letter.text}
                            onCommit={text => setLetter({ text })}
                            rows={6}
                            maxLength={5000}
                            placeholder="Абзацы — с новой строки"
                        />
                        <p className="text-xs text-muted-foreground">
                            Выделить фразу: оберните её в &lt;color&gt;…&lt;/color&gt; (синим), &lt;bold&gt;…&lt;/bold&gt;
                            (жирным) или &lt;red&gt;…&lt;/red&gt; (красным).
                        </p>
                    </div>
                </div>
            </SectionCard>
        </>
    );
};
