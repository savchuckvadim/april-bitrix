'use client';
import { CheckIcon, SaveIcon } from 'lucide-react';
import { HeaderAction, Preloader } from '@/modules/shared';
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
        <HeaderAction
            icon={isSaved ? CheckIcon : SaveIcon}
            iconClassName={isSaved ? 'text-primary transition' : undefined}
            label={isSaved ? 'Сохранено' : 'Сохранить фильтр'}
            onClick={save}
        />
    );
};

export default SaveFilter;
