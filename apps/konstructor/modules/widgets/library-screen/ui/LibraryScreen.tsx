'use client';

import { BadgePercent, Star } from 'lucide-react';
import { ChoiceChips } from '@workspace/april-ui/fields';
import { EmptyState } from '@workspace/april-ui/feedback';
import { Button } from '@workspace/ui/components/button';
import { LIBRARY_KIND_TITLE, type LibraryKind, type LibraryScopeFilter } from '@/modules/entities/library';
import { Screen, ScreenHeader } from '@/modules/shared';
import { useLibraryScreen } from '../hooks/use-library-screen';
import { LibraryItemCard } from './LibraryItemCard';

const SCOPE_OPTIONS: Array<{ value: LibraryScopeFilter; label: string }> = [
    { value: 'all', label: 'Все' },
    { value: 'own', label: 'Мои' },
    { value: 'department', label: 'Отдела' },
    { value: 'portal', label: 'Портала' },
];

const COPY: Record<LibraryKind, { description: string; empty: string }> = {
    favorite: {
        description: 'Сохранённые предложения — ваши, отдела и портала. Загрузите, и сразу к документам.',
        empty: 'Соберите предложение и нажмите «В избранное» на шаге «Цены».',
    },
    promotion: {
        description: 'Акционные комплекты: состав и цены собраны заранее, можно подправить.',
        empty: 'Действующих акций пока нет — руководитель или April заведут их здесь.',
    },
};

export interface LibraryScreenProps {
    kind: LibraryKind;
}

/** Избранное / Акции: плитки заготовок с фильтром видимости. */
export const LibraryScreen = ({ kind }: LibraryScreenProps) => {
    const screen = useLibraryScreen(kind);
    const copy = COPY[kind];

    return (
        <Screen>
            <ScreenHeader
                title={LIBRARY_KIND_TITLE[kind].many}
                description={copy.description}
                actions={
                    <ChoiceChips
                        ariaLabel="Видимость заготовок"
                        value={screen.scope}
                        options={SCOPE_OPTIONS}
                        onChange={value => screen.setScope(value as LibraryScopeFilter)}
                    />
                }
            />
            {screen.error ? (
                <EmptyState
                    tone="destructive"
                    title="Библиотека не загрузилась"
                    description={screen.error}
                    actions={<Button onClick={() => void screen.refresh()}>Повторить</Button>}
                />
            ) : screen.isLoading ? (
                <p className="text-sm text-muted-foreground">Загружаю…</p>
            ) : screen.items.length === 0 ? (
                <EmptyState
                    icon={kind === 'promotion' ? BadgePercent : Star}
                    tone={kind === 'promotion' ? 'info' : 'warning'}
                    title={screen.total === 0 ? 'Пока пусто' : 'Ничего не подходит под фильтр'}
                    description={screen.total === 0 ? copy.empty : 'Снимите фильтр видимости.'}
                    actions={
                        <>
                            <Button variant="ghost" onClick={screen.toStart}>
                                Назад
                            </Button>
                            <Button onClick={screen.toCreate}>Создать с нуля</Button>
                        </>
                    }
                />
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {screen.items.map(item => (
                        <LibraryItemCard
                            key={item.id}
                            item={item}
                            busy={screen.loadingId === item.id}
                            onLoad={() => void screen.load(item.id)}
                            onRename={title => void screen.rename(item.id, title)}
                            onArchive={() => void screen.archive(item.id)}
                            onRemove={() => void screen.remove(item.id)}
                        />
                    ))}
                </div>
            )}
        </Screen>
    );
};
