import { FC } from 'react';

export const Preloader: FC<{ phrase?: string }> = ({ phrase }) => {
    const resultPhrase = !phrase ? 'Загрузка . . .' : phrase;

    return (
        <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-3 bg-muted/40">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">{resultPhrase}</p>
        </div>
    );
};
