'use client';

import { WordTemplateSettingsPage } from '@/modules/entities/offer-template-word';
import { Screen, ScreenHeader } from '@/modules/shared';

/** Настройки: шаблоны документов (Word). */
export default function SettingsPage() {
    return (
        <Screen>
            <ScreenHeader
                title="Шаблоны документов"
                description="Шаблоны Word для КП и счёта: выбор, создание, превью."
            />
            <WordTemplateSettingsPage />
        </Screen>
    );
}
