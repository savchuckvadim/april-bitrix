import { Button } from '@workspace/ui/components/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@workspace/ui/components/tooltip';
// import { Save, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@workspace/ui/lib/utils'; // если у тебя есть класс name helper
import { Preloader } from '@/modules/shared';
import { useReport } from '@/modules/entities/report/model';
import { CheckIcon, SaveIcon } from 'lucide-react';
import { div } from 'framer-motion/client';

const SaveFilter = () => {
    const { isFilterLoading, handleSaveFilter } = useReport();
    const [saved, setSaved] = useState(false);

    const onSave = async () => {
        setSaved(false);
        handleSaveFilter();
        setSaved(true);

        // сбросить состояние через 2 секунды
        setTimeout(() => setSaved(false), 2000);
    };

    return isFilterLoading ? (
        <div className="flex justify-center items-center mr-3">
            <Preloader />
        </div>
    ) : (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    onClick={onSave}
                    disabled={isFilterLoading}
                    className={cn(
                        'cursor-pointer icon transition-all',
                        saved && 'text-foreground',
                    )}
                    variant={'outline'}
                >
                    {saved ? (
                        <CheckIcon className="transition text-primay" />
                    ) : (
                        <SaveIcon />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent className="text-xs">
                {saved ? 'Сохранено' : 'Сохранить фильтр'}
            </TooltipContent>
        </Tooltip>
    );
};

export default SaveFilter;
