'use client';

import { useEffect, useState } from 'react';
import { SectionCard } from '@workspace/april-ui';
import { useAiSettingsForm } from '../../hooks/use-ai-settings-form';
import type { AiSettingsTab } from '../../lib/ai-settings-form.util';
import { AI_SETTINGS_INLINE_TEXT, AI_SETTINGS_SECTION_TEXT } from '../../lib/ai-settings-sections.texts';
import { aiSettingsSectionId } from '../../lib/ai-tabs';
import { AiSettingsConfirm } from './AiSettingsConfirm';
import { AiSettingsSummary } from './AiSettingsSummary';
import { AiSettingsSectionBody } from './AiSettingsSectionBody';
import { AiSettingsInlineFooter } from './AiSettingsInlineFooter';
import { AiTheoryLink } from './AiTheoryLink';

interface AiSettingsInlineProps {
    /** Секции настроек этой подвкладки в порядке показа. */
    sections: readonly AiSettingsTab[];
    /** Какой набор: по сотрудникам или витрина (заголовок и описание). */
    kind: keyof Pick<typeof AI_SETTINGS_INLINE_TEXT, 'employees' | 'showcase'>;
    /** Секция из URL, к которой прокрутить после монтирования. */
    focusSection: AiSettingsTab | null;
}

interface AiSettingsInlineFormProps extends Omit<AiSettingsInlineProps, 'kind'> {
    onReset: () => void;
}

const SECTION_TITLE = 'text-sm font-semibold';

/** Прокрутка к секции из URL — один раз на значение, когда секция на экране. */
const useScrollToSection = (
    focusSection: AiSettingsTab | null,
    sections: readonly AiSettingsTab[],
) => {
    useEffect(() => {
        if (!focusSection || !sections.includes(focusSection)) return;
        const element = document.getElementById(aiSettingsSectionId(focusSection));
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [focusSection, sections]);
};

/**
 * Форма настроек, раскрытая секциями (та же логика, что у диалога:
 * useAiSettingsForm; в payload уходят только изменённые блоки; блоки,
 * рвущие сравнимую историю, требуют подтверждения; после ответа — сводка).
 * Пересобирается заново по ключу родителя после «Продолжить правку».
 */
const AiSettingsInlineForm = ({ sections, focusSection, onReset }: AiSettingsInlineFormProps) => {
    const form = useAiSettingsForm(true, sections[0]);
    useScrollToSection(focusSection, sections);

    if (form.step === 'done' && form.summary) {
        return (
            <div className="space-y-3">
                <AiSettingsSummary summary={form.summary} />
                <AiSettingsInlineFooter form={form} onReset={onReset} />
            </div>
        );
    }
    if (form.step === 'confirm') {
        return (
            <div className="space-y-3">
                <AiSettingsConfirm blocks={form.breakingBlocks} />
                <AiSettingsInlineFooter form={form} onReset={onReset} />
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {sections.map(tab => (
                <section
                    key={tab}
                    id={aiSettingsSectionId(tab)}
                    className="scroll-mt-20 space-y-2"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className={SECTION_TITLE}>
                            {AI_SETTINGS_SECTION_TEXT[tab].label}
                        </h4>
                        {form.errorTabs.includes(tab) && (
                            <span
                                aria-label={AI_SETTINGS_INLINE_TEXT.footer.hasErrors}
                                title={AI_SETTINGS_INLINE_TEXT.footer.hasErrors}
                                className="size-1.5 rounded-full bg-destructive"
                            />
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {AI_SETTINGS_SECTION_TEXT[tab].description}
                    </p>
                    <AiSettingsSectionBody tab={tab} form={form} />
                </section>
            ))}
            <AiSettingsInlineFooter form={form} onReset={onReset} />
        </div>
    );
};

/**
 * Карточка настроек витрины на подвкладке: заголовок набора, ссылка на
 * теорию и раскрытые секции с общей кнопкой сохранения. После сводки
 * «Продолжить правку» собирает форму заново из актуальных настроек.
 */
export const AiSettingsInline = ({ sections, kind, focusSection }: AiSettingsInlineProps) => {
    const [formVersion, setFormVersion] = useState(0);
    const text = AI_SETTINGS_INLINE_TEXT[kind];

    return (
        <SectionCard
            surface="glass"
            title={text.title}
            description={text.description}
            actions={<AiTheoryLink topic="levels" variant="icon" />}
        >
            <AiSettingsInlineForm
                key={formVersion}
                sections={sections}
                focusSection={focusSection}
                onReset={() => setFormVersion(version => version + 1)}
            />
        </SectionCard>
    );
};
