'use client';

import * as React from 'react';
import Link from 'next/link';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { Label } from '@workspace/ui/components/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { AI_PROVIDERS_META, AI_TRANSCRIPTION_MODE_OPTIONS } from '../../../model';
import { ProviderOrderField, ProviderTextField } from './ProviderFields';
import { ProvidersReadiness } from './ProvidersReadiness';

/** Сентинел селекта «как в приложении» (Radix Select не принимает ''). */
export const PROVIDER_GLOBAL = '__global__';

/** Черновик блока «Поставщики AI»: строки, пусто = «как в приложении». */
export interface ProvidersDraft {
    /** Порядок провайдеров LLM; пустой список = порядок приложения. */
    llmProviderOrder: string[];
    /** Режим транскрибации или PROVIDER_GLOBAL. */
    transcriptionMode: string;
    whisperBaseUrl: string;
    whisperModel: string;
    /** Новый ключ, маска сохранённого (••••••) или пусто (убрать ключ). */
    whisperApiKey: string;
}

interface ProvidersCardProps {
    portalId: number;
    draft: ProvidersDraft;
    onChange: (patch: Partial<ProvidersDraft>) => void;
}

/**
 * Карточка «Поставщики AI»: чем портал считает разборы и чем транскрибирует,
 * с переключением без выкладки — на случай сбоя или подорожания поставщика
 * и для клиентов со своим ключом. Сверху — чек-лист сохранённого состояния
 * с сервера, ниже — поля формы (сохраняются общей кнопкой страницы).
 */
export function ProvidersCard({ portalId, draft, onChange }: ProvidersCardProps) {
    const modeMeta = AI_PROVIDERS_META.transcriptionMode;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Поставщики AI</CardTitle>
                <CardDescription>
                    Кто делает разборы и кто переводит записи в текст. Поменять
                    поставщика можно здесь, без выкладки: изменения действуют в
                    течение минуты. Ключи поставщиков (VibeCode, свой LLM клиента)
                    заводятся на странице{' '}
                    <Link
                        href={`/portal/${portalId}/keys`}
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                        «Ключи портала»
                    </Link>
                    .
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <ProvidersReadiness portalId={portalId} />

                <div className="grid gap-6 lg:grid-cols-2">
                    <ProviderOrderField
                        value={draft.llmProviderOrder}
                        onChange={(llmProviderOrder) => onChange({ llmProviderOrder })}
                    />

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <Label>{modeMeta.label}</Label>
                            <Select
                                value={draft.transcriptionMode}
                                onValueChange={(transcriptionMode) =>
                                    onChange({ transcriptionMode })
                                }
                            >
                                <SelectTrigger className="w-full max-w-md">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={PROVIDER_GLOBAL}>
                                        Как в приложении
                                    </SelectItem>
                                    {AI_TRANSCRIPTION_MODE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm text-muted-foreground">
                                {modeMeta.description}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                                {modeMeta.globalHint}
                            </p>
                        </div>

                        <ProviderTextField
                            meta={AI_PROVIDERS_META.whisperBaseUrl}
                            value={draft.whisperBaseUrl}
                            placeholder="https://api.groq.com/openai/v1"
                            onChange={(whisperBaseUrl) => onChange({ whisperBaseUrl })}
                        />
                        <ProviderTextField
                            meta={AI_PROVIDERS_META.whisperModel}
                            value={draft.whisperModel}
                            placeholder="whisper-large-v3-turbo"
                            onChange={(whisperModel) => onChange({ whisperModel })}
                        />
                        <ProviderTextField
                            meta={AI_PROVIDERS_META.whisperApiKey}
                            value={draft.whisperApiKey}
                            placeholder="не задан"
                            secret
                            onChange={(whisperApiKey) => onChange({ whisperApiKey })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
