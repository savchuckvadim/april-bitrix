'use client';

import * as React from 'react';
import { ABadge, GlassCard, PreloaderMicro } from '@workspace/april-ui';
import { useAiMaterialsCallTypes } from '../../lib/hooks/use-ai-materials';

interface CallTypesCardProps {
    domain: string;
}

/**
 * Итоговый реестр типов звонков домена: встроенные + общие + клиентские
 * (из документа раздела call-type-registry). Показывает, какие типы
 * реально действуют при анализе звонков этого портала.
 */
export function CallTypesCard({ domain }: CallTypesCardProps) {
    const { data, isLoading, error } = useAiMaterialsCallTypes(domain);

    return (
        <GlassCard>
            <div className="flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Типы звонков портала
                    </h2>
                    {data && (
                        <ABadge
                            size="xsmall"
                            isActive
                            color={data.source === 'knowledge' ? 'april' : 'grey'}
                            title={
                                data.source === 'knowledge'
                                    ? 'С документами'
                                    : 'Встроенные'
                            }
                        />
                    )}
                </div>
                <p className="text-sm text-muted-foreground">
                    Тип определяет фокус анализа звонка. Свои типы и правки
                    добавляются документом в разделе «Реестр типов звонков»
                    (call-type-registry).
                </p>

                {isLoading && (
                    <PreloaderMicro phrase="Загружаем типы звонков…" />
                )}
                {error && (
                    <p className="text-sm text-red-600">
                        Не удалось получить типы: {error.message}
                    </p>
                )}

                {data?.types.map((type) => (
                    <div
                        key={type.code}
                        className="rounded-md border border-border p-3"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{type.title}</span>
                            <span className="font-mono text-xs text-muted-foreground">
                                {type.code}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {type.focus}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Материалы анализа — раздел «{type.knowledgeKind}»
                        </p>
                    </div>
                ))}
            </div>
        </GlassCard>
    );
}
