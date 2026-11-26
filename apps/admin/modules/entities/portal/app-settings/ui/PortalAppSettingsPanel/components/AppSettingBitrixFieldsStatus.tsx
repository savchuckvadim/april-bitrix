'use client';

import { Button } from '@workspace/ui/components/button';

interface AppSettingBitrixFieldsStatusProps {
    /** Владелец уже попросил список (кликнул в поиск). */
    requested: boolean;
    loading: boolean;
    failed: boolean;
    /** Текст, если портал отдал поля урезанно или не отдал вовсе. */
    degradedText: string | null;
    /** Выбранные UF-имена — видны и до загрузки списка. */
    selected: string[];
    onRetry: () => void;
}

/**
 * Строка состояния под поиском поля: что выбрано, грузится ли список и чем
 * кончилась загрузка. Список полей тянется из Битрикса портала, поэтому до
 * клика в поиск его не просим — иначе каждое открытие настроек ходило бы
 * в портал за всеми полями.
 */
export const AppSettingBitrixFieldsStatus = ({
    requested,
    loading,
    failed,
    degradedText,
    selected,
    onRetry,
}: AppSettingBitrixFieldsStatusProps) => {
    if (!requested) {
        return (
            <div className="space-y-1 text-sm">
                {selected.length > 0 && (
                    <p>
                        Выбрано:{' '}
                        <code className="font-mono text-[11px]">
                            {selected.join(', ')}
                        </code>
                    </p>
                )}
                <p className="text-xs text-muted-foreground">
                    Список полей портала загрузится, когда начнёте поиск.
                </p>
            </div>
        );
    }
    if (loading) {
        return (
            <p className="text-sm text-muted-foreground">
                Загружаю поля портала…
            </p>
        );
    }
    if (failed) {
        return (
            <div className="flex items-center gap-2">
                <p className="text-sm text-destructive">
                    Не удалось загрузить поля портала.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                    Повторить
                </Button>
            </div>
        );
    }
    if (degradedText) {
        return <p className="text-sm text-amber-600">{degradedText}</p>;
    }
    return null;
};
