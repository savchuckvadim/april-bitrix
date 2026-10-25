'use client';

import { ActionTile } from '@workspace/april-ui/actions';
import { ToneBadge } from '@workspace/april-ui/badges';
import { Screen, ScreenHeader } from '@/modules/shared';
import { useStartScreen } from '../hooks/use-start-screen';

/** Старт нового предложения: Избранное · Акции · Создать. */
export const StartScreen = () => {
    const start = useStartScreen();

    return (
        <Screen>
            <ScreenHeader
                title="Новое предложение"
                description="Выберите, с чего начать сборку."
            />
            <div className="grid gap-4 sm:grid-cols-3">
                {start.actions.map(action => (
                    <ActionTile
                        key={action.route}
                        icon={action.icon}
                        tone={action.tone}
                        title={action.title}
                        description={action.description}
                        badge={
                            action.soon ? (
                                <ToneBadge tone="muted" variant="soft">
                                    скоро
                                </ToneBadge>
                            ) : null
                        }
                        onClick={() => start.open(action.route)}
                    />
                ))}
            </div>
        </Screen>
    );
};
