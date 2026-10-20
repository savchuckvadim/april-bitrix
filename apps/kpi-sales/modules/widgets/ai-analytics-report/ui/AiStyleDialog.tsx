'use client';

import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@workspace/ui/components/dialog';
import { GlassDialog } from '@workspace/april-ui';
import { useAiStyle } from '../hooks/use-ai-style';
import { useAiManagerName } from '../hooks/use-ai-manager-name';
import { AiHowWeCountButton } from './components/AiHowWeCountButton';
import { AiTheoryLink } from './components/AiTheoryLink';
import { AiSectionState } from './components/AiSectionState';
import { AiStyleCardBody, AiStyleCardMeta } from './components/AiStyleCardBody';

export interface AiStyleDialogProps {
    managerId: string;
    /** Месяц окна YYYY-MM; без месяца — последний рассчитанный профиль. */
    month?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/**
 * Тонкая обёртка карточки стиля менеджера (manager/style) в диалоге —
 * запасной путь, когда ссылки на страницу сотрудника нет (публичный
 * снимок). Содержимое — AiStyleCardBody, то же, что на подвкладке «Стиль»
 * страницы сотрудника. Стиль — не оценка качества: в нормы, цели и премии
 * не входит.
 */
export const AiStyleDialog = ({
    managerId,
    month,
    open,
    onOpenChange,
}: AiStyleDialogProps) => {
    const style = useAiStyle(managerId, month, open);
    const managerName = useAiManagerName();
    const card = style.data;

    return (
        <GlassDialog
            open={open}
            onOpenChange={onOpenChange}
            size="md"
            intensity="soft"
            cardClassName="max-h-[85vh] gap-4 overflow-hidden"
        >
            <DialogHeader>
                <div className="flex items-center gap-2">
                    <DialogTitle>Стиль: {managerName(managerId)}</DialogTitle>
                    <AiHowWeCountButton endpoint="manager/style" />
                    <AiTheoryLink topic="style" variant="icon" />
                </div>
                <DialogDescription>
                    Как менеджер работает — отклонение от нормы коллег по осям
                    стиля. Это не оценка качества: у каждой оси два законных
                    полюса.
                </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
                <AiSectionState
                    status={style.status}
                    error={style.error}
                    loadingText="Читаем профиль стиля…"
                    onRetry={style.retry}
                />
                {card && <AiStyleCardBody card={card} />}
            </div>
            {card && (
                <DialogFooter className="sm:justify-start">
                    <AiStyleCardMeta card={card} />
                </DialogFooter>
            )}
        </GlassDialog>
    );
};
