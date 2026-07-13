import { BX_TASK_MARK } from '@workspace/bx/src/type/bitrix-type';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '@workspace/ui/lib/utils';
import { useTaskMark } from '@/modules/entities/EventServiceTask/hooks/use-task-mark';

const Mark = () => {
    const { currentMark, isMarkLoading, updateTaskMark } = useTaskMark();

    const getMarkConfig = (mark: BX_TASK_MARK | null) => {
        switch (mark) {
            case BX_TASK_MARK.GOOD:
                return {
                    icon: <ThumbsUp size={16} />,
                    text: 'Положительная',
                    className: 'border-chart-2 text-chart-2 bg-chart-2/5',
                };
            case BX_TASK_MARK.BAD:
                return {
                    icon: <ThumbsDown size={16} />,
                    text: 'Отрицательная',
                    className: 'border-destructive text-destructive bg-destructive/5',
                };
            default:
                return {
                    icon: <Minus size={16} />,
                    text: 'Не оценено',
                    className: 'border-border text-muted-foreground bg-background',
                };
        }
    };

    const markConfig = getMarkConfig(currentMark);

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="flex-1 text-sm text-muted-foreground">
                    Не забудьте оценить правильность сигнала, поставив оценку в задаче
                </p>

                <div className="flex items-center gap-2">
                    <p className="m-0 text-sm">Оценка:</p>
                    <button
                        className={cn(
                            'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors',
                            markConfig.className,
                            isMarkLoading && 'animate-pulse opacity-70',
                        )}
                        onClick={updateTaskMark}
                        disabled={isMarkLoading}
                    >
                        {markConfig.icon}
                        <span>{markConfig.text}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Mark;
