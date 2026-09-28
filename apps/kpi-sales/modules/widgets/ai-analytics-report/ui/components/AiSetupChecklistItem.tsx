'use client';

import { ArrowRight, Settings2 } from 'lucide-react';
import { Button } from '@workspace/ui/components/button';
import { LiquidProgress, ToneBadge } from '@workspace/april-ui';
import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import { aiChecklistTheoryTopic } from '../../lib/ai-setup-checklist.data';
import {
    AI_CHECKLIST_ACTION,
    type AiChecklistItem,
} from '../../lib/ai-setup-checklist.types';
import {
    aiChecklistProgressShare,
    formatAiChecklistEta,
    formatAiChecklistProgress,
} from '../../lib/ai-setup-checklist.util';
import { AiTheoryLink } from './AiTheoryLink';

interface AiSetupChecklistItemProps {
    item: AiChecklistItem;
    /** Открыть вкладку настроек; нет — кнопок вкладок нет (только чтение). */
    onOpenSettings?: (tab: AiSettingsTab) => void;
}

/**
 * Пункт чек-листа: заголовок (+ «по желанию»), срок, ссылка на теорию,
 * деталь с числами, «откроет», прогресс и действия — кнопка вкладки
 * настроек или текст «кто и где это делает».
 */
export const AiSetupChecklistItem = ({
    item,
    onOpenSettings,
}: AiSetupChecklistItemProps) => {
    const theory = aiChecklistTheoryTopic(item.code);

    return (
        <li className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                {item.optional && (
                    <ToneBadge tone="muted" variant="soft" size="sm">
                        по желанию
                    </ToneBadge>
                )}
                {item.eta && (
                    <ToneBadge tone="info" variant="outline" size="sm">
                        ждём: {formatAiChecklistEta(item.eta)}
                    </ToneBadge>
                )}
                {theory && <AiTheoryLink topic={theory} label="теория" />}
            </div>
            <p className="text-xs text-muted-foreground">{item.detail}</p>
            {item.progress && (
                <div className="flex max-w-xs items-center gap-2">
                    <LiquidProgress
                        size="sm"
                        tone="warning"
                        value={aiChecklistProgressShare(item.progress)}
                    />
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {formatAiChecklistProgress(item.progress)}
                    </span>
                </div>
            )}
            {item.unlocks && (
                <p className="text-xs text-muted-foreground">
                    Откроет: {item.unlocks}
                </p>
            )}
            {item.actions.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    {item.actions.map(action =>
                        action.kind === AI_CHECKLIST_ACTION.SETTINGS ? (
                            onOpenSettings && (
                                <Button
                                    key={action.tab}
                                    variant="outline"
                                    size="sm"
                                    className="h-6 gap-1 px-2 text-xs"
                                    onClick={() => onOpenSettings(action.tab)}
                                >
                                    <Settings2 className="h-3 w-3" />
                                    {action.label}
                                </Button>
                            )
                        ) : (
                            <span
                                key={action.text}
                                className="flex items-start gap-1 text-xs"
                            >
                                <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                                {action.text}
                            </span>
                        ),
                    )}
                </div>
            )}
        </li>
    );
};
