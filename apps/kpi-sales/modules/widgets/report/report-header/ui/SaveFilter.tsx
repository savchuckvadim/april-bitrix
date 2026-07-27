'use client';
import { Button } from '@workspace/ui/components/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { cn } from '@workspace/ui/lib/utils';
import { CheckIcon, SaveIcon } from 'lucide-react';
import { Preloader } from '@/modules/shared';
import { useSaveFilter } from '@/modules/feature/report-flow';

/** Кнопка «Сохранить фильтр»: вся логика статуса — в useSaveFilter. */
const SaveFilter = () => {
    const { isSaving, isSaved, save } = useSaveFilter();

    if (isSaving) {
        return (
            <div className="mr-3 flex items-center justify-center">
                <Preloader />
            </div>
        );
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={save}
                    className={cn(
                        'icon h-8 cursor-pointer transition-all',
                        isSaved && 'text-foreground',
                    )}
                    variant="outline"
                >
                    {isSaved ? (
                        <CheckIcon className="text-primary transition" />
                    ) : (
                        <SaveIcon />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
                {isSaved ? 'Сохранено' : 'Сохранить фильтр'}
            </TooltipContent>
        </Tooltip>
    );
};

export default SaveFilter;
