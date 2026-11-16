'use client';

import { SwitchField } from '@workspace/april-ui/fields';
import { useOfferPdfSettingsForm } from './hooks/use-offer-pdf-settings-form';

/** Что включить в документ; страницы, которых у стиля нет, не предлагаются */
export const OfferPdfToggles = () => {
    const { settings, setSetting, toggles } = useOfferPdfSettingsForm();
    return (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {toggles.map(toggle => (
                <SwitchField
                    key={toggle.key}
                    id={`offer-pdf-${toggle.key}`}
                    label={toggle.label}
                    hint={toggle.hint}
                    checked={settings[toggle.key]}
                    onChange={value => setSetting(toggle.key, value)}
                />
            ))}
        </div>
    );
};
