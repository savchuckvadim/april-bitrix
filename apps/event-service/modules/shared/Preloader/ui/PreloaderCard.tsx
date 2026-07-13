import { FC } from 'react';
import { EVCard } from '@workspace/april-ui';

export const PreloaderCard: FC<{}> = () => {
    return (
        <EVCard title={''} width={12}>
            <div className="flex min-h-[120px] w-full items-center justify-center rounded-xl bg-muted/40">
                <p className="animate-pulse text-sm text-muted-foreground">Загрузка . . .</p>
            </div>
        </EVCard>
    );
};
