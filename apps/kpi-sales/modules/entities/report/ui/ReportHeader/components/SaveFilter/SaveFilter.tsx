import { useReport } from '@/modules/entities/report/model';
import { Preloader } from '@/modules/shared';
import { Button } from '@workspace/ui/components/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@workspace/ui/components/tooltip';
import { Save } from 'lucide-react';


const SaveFilter = () => {
    const { isFilterLoading, handleSaveFilter } = useReport();
    return <>{!isFilterLoading ?
        <>
            <Tooltip>
                <TooltipTrigger>
                    <Button onClick={handleSaveFilter}

                        className='cursor-pointer icon'
                        variant='outline'
                    >
                        <Save />
                    </Button>
                </TooltipTrigger>
                <TooltipContent className='text-xs'>
                    Сохранить фильтр
                </TooltipContent>
            </Tooltip>
        </> : <Preloader />}
    </>;
};

export default SaveFilter;