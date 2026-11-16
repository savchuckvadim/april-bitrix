'use client';

import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import {
    filledBands,
    setAnchor,
    trimAnchors,
} from '../../../lib/methodology-materials.util';
import type { MethodologyCatalog } from '../../../model';
import {
    METHODOLOGY_ANCHORS_TEXT,
    type MethodologyAnchors,
} from '../../../model/methodology-materials';

interface AnchorsEditorProps {
    anchors: MethodologyAnchors;
    catalog: MethodologyCatalog | undefined;
    /** undefined — якорей не осталось, поле уходит из конфига. */
    onChange: (next: MethodologyAnchors | undefined) => void;
}

/**
 * Якоря оценок: словесное описание каждой полосы шкалы по разделам
 * разговора. Разделы и полосы — из каталога формы.
 */
export const AnchorsEditor = ({ anchors, catalog, onChange }: AnchorsEditorProps) => {
    const texts = METHODOLOGY_ANCHORS_TEXT;
    const sections = catalog?.sections ?? [];
    const bands = catalog?.anchorBands ?? [];

    if (sections.length === 0 || bands.length === 0) {
        return <p className="text-sm text-muted-foreground">{texts.noSections}</p>;
    }
    return (
        <div className="space-y-4">
            <div className="space-y-1 text-sm text-muted-foreground">
                <p>{texts.intro}</p>
                <p>{texts.versionHint}</p>
            </div>
            {sections.map(section => (
                <div
                    key={section.code}
                    className="space-y-3 rounded-lg border border-border/70 p-3"
                >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium">{section.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {texts.filled(filledBands(anchors, section.code))}
                        </p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                        {bands.map(band => {
                            const id = `anchor-${section.code}-${band}`;
                            return (
                                <div key={band} className="space-y-1">
                                    <Label htmlFor={id}>{texts.band(band)}</Label>
                                    <Textarea
                                        id={id}
                                        rows={2}
                                        placeholder={texts.placeholder}
                                        value={anchors[section.code]?.[band] ?? ''}
                                        onChange={event =>
                                            onChange(
                                                setAnchor(
                                                    anchors,
                                                    section.code,
                                                    band,
                                                    event.target.value,
                                                ),
                                            )
                                        }
                                        onBlur={() => onChange(trimAnchors(anchors))}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
