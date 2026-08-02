'use client';

import type { FC } from 'react';
import { Copy, Download, Printer } from 'lucide-react';
import { GlassCard } from '@workspace/april-ui';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { useRegulation } from '../hooks/use-regulation';
import type {
    ProcessConfig,
    ProcessDefinition,
    ProcessModel,
    ProcessPreset,
} from '../types';

interface RegulationPanelProps {
    definition: ProcessDefinition;
    model: ProcessModel;
    config: ProcessConfig;
    preset: ProcessPreset | null;
}

/**
 * Готовый регламент работы по выбранной конфигурации.
 *
 * Это то, что заказчик уносит со встречи: не картинка, а текст, который можно
 * распечатать и утвердить. Пересобирается на каждое движение крутилки, поэтому
 * всегда соответствует тому, что нарисовано выше.
 */
export const RegulationPanel: FC<RegulationPanelProps> = ({
    definition,
    model,
    config,
    preset,
}) => {
    const { company, setCompany, preview, status, download, copy, print } =
        useRegulation({ definition, model, config, preset });

    return (
        <section className="process-regulation flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline gap-3 print:hidden">
                <h2 className="text-foreground text-sm font-bold tracking-widest uppercase">
                    Регламент работы
                </h2>
                <p className="text-muted-foreground text-xs">
                    собран по вашим настройкам — можно распечатать и утвердить
                </p>
            </div>

            <GlassCard
                intensity="strong"
                className="rounded-2xl p-4 print:border-none print:bg-transparent print:p-0 print:shadow-none"
            >
                <div className="flex flex-wrap items-center gap-2 print:hidden">
                    <Input
                        value={company}
                        onChange={event => setCompany(event.target.value)}
                        placeholder="Организация"
                        className="w-full sm:w-64"
                    />

                    <Button onClick={download} className="gap-1.5">
                        <Download className="h-4 w-4" />
                        Скачать .txt
                    </Button>

                    <Button
                        variant="outline"
                        onClick={print}
                        className="gap-1.5"
                    >
                        <Printer className="h-4 w-4" />
                        Печать
                    </Button>

                    <Button variant="ghost" onClick={copy} className="gap-1.5">
                        <Copy className="h-4 w-4" />
                        Скопировать
                    </Button>

                    <span
                        role="status"
                        aria-live="polite"
                        className="text-success text-xs font-semibold"
                    >
                        {status}
                    </span>
                </div>

                <pre className="text-foreground/90 mt-3 max-h-[28rem] overflow-auto rounded-lg border p-4 font-mono text-[11px] leading-relaxed whitespace-pre print:mt-0 print:max-h-none print:overflow-visible print:border-none print:p-0 print:text-[10px]">
                    {preview}
                </pre>
            </GlassCard>
        </section>
    );
};
