'use client';

import React from 'react';
import { DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { GlassDialog } from '@workspace/april-ui';
import { Settings2, Target } from 'lucide-react';
import { useAppSelector } from '@/modules/app/lib/hooks/redux';
import { GlassActionStatus } from '@/modules/shared';
import { usePlansSettings } from '../hooks/use-plans-settings';
import { PlansIndicatorSettingsRow } from './PlansIndicatorSettingsRow';
import { PlansTargetsGrid } from './PlansTargetsGrid';

interface PlansSettingsDialogProps {
    isOpen: boolean;
    setOpen: (open: boolean) => void;
    settings: ReturnType<typeof usePlansSettings>;
}

/**
 * Стеклянная карточка настроек планов (только руководители): включение
 * показателей + свои имена + период задания, затем сетка целей
 * сотрудников. «Сохранить» пишет конфиг портала и цели в Bitrix
 * user-поля (недостающие поля бэк доустановит сам).
 */
export const PlansSettingsDialog: React.FC<PlansSettingsDialogProps> = ({
    isOpen,
    setOpen,
    settings,
}) => {
    const catalog = useAppSelector(state => state.plans.catalog);
    const enabledDraft = settings.draftIndicators
        .filter(config => config.enabled)
        .flatMap(config => {
            const meta = catalog.find(item => item.code === config.code);
            return meta ? [{ meta, config }] : [];
        });

    return (
        <GlassDialog
            open={isOpen}
            onOpenChange={setOpen}
            size="xl"
            cardClassName="max-h-[85vh] gap-4 overflow-hidden"
        >
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                Плановые показатели
            </DialogTitle>

            {/* Статус-панель долгого сохранения (паттерн создания
                        публичной ссылки): прогресс → успех/ошибка. */}
            {settings.saveStatus === 'saving' && (
                <GlassActionStatus
                    status="progress"
                    title="Сохраняем планы…"
                    description={
                        'Записываем цели в Bitrix. При первом сохранении ' +
                        'дополнительно устанавливаются плановые поля ' +
                        'сотрудников — это может занять до минуты.'
                    }
                />
            )}
            {settings.saveStatus === 'saved' && (
                <GlassActionStatus
                    status="success"
                    title="Планы сохранены"
                    description="Показатели и цели записаны в Bitrix — отчёт уже считает достижение."
                    actions={
                        <Button size="sm" onClick={() => setOpen(false)}>
                            Готово
                        </Button>
                    }
                />
            )}
            {settings.saveStatus === 'error' && (
                <GlassActionStatus
                    status="error"
                    title="Не удалось сохранить"
                    error={settings.saveError}
                    actions={
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={settings.resetStatus}
                        >
                            Вернуться к настройкам
                        </Button>
                    }
                />
            )}

            {settings.saveStatus === 'idle' && (
                <>
                    <div className="space-y-2 overflow-auto">
                        <div className="flex items-start justify-between gap-2">
                            <p className="text-xs text-muted-foreground">
                                Включите показатели, при желании переименуйте и
                                выберите период, на который задаёте план. Отчёт
                                пересчитает план под выбранный период просмотра.
                            </p>
                            {/* По умолчанию — только настроенные; шестерёнка
                                раскрывает весь каталог показателей. */}
                            {settings.canToggleIndicators && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 gap-1 text-xs text-muted-foreground"
                                    onClick={settings.toggleShowAllIndicators}
                                >
                                    <Settings2 className="h-3.5 w-3.5" />
                                    {settings.showAllIndicators
                                        ? 'Только настроенные'
                                        : 'Все показатели'}
                                </Button>
                            )}
                        </div>
                        <div className="grid gap-2">
                            {settings.visibleIndicators.map(config => {
                                const meta = catalog.find(
                                    item => item.code === config.code,
                                );
                                if (!meta) return null;
                                return (
                                    <PlansIndicatorSettingsRow
                                        key={config.code}
                                        meta={meta}
                                        config={config}
                                        onPatch={patch =>
                                            settings.patchIndicator(
                                                config.code,
                                                patch,
                                            )
                                        }
                                    />
                                );
                            })}
                        </div>

                        <p className="pt-2 text-xs text-muted-foreground">
                            Планы сотрудников (пусто — план не задан):
                        </p>
                        <PlansTargetsGrid
                            indicators={enabledDraft}
                            employees={settings.employees}
                            valueOf={settings.targetValue}
                            onChange={settings.setTargetValue}
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOpen(false)}
                        >
                            Отмена
                        </Button>
                        <Button size="sm" onClick={settings.save}>
                            Сохранить
                        </Button>
                    </div>
                </>
            )}
        </GlassDialog>
    );
};
