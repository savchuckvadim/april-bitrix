'use client';

import { ToneBadge } from '@workspace/april-ui/badges';
import type { MethodologyPreviewView } from '../../../lib/methodology-preview-view.util';
import { METHODOLOGY_PREVIEW_TEXT } from '../../../model/methodology-preview';

/** Итог проверки черновика: сводка, пункты с цитатами, ограничители. */
export const PreviewResult = ({ view }: { view: MethodologyPreviewView }) => {
    const texts = METHODOLOGY_PREVIEW_TEXT;
    return (
        <div className="space-y-4 rounded-lg border border-border/70 p-3">
            <div className="space-y-1 text-sm">
                {view.summary.map(line => (
                    <p key={line}>{line}</p>
                ))}
            </div>
            {!view.applicable && (
                <p className="text-sm text-muted-foreground">{texts.notApplicable}</p>
            )}
            {view.checkpoints.length > 0 && (
                <ul className="space-y-3">
                    {view.checkpoints.map(checkpoint => (
                        <li key={checkpoint.code} className="space-y-1 text-sm">
                            <div className="flex flex-wrap items-center gap-2">
                                <ToneBadge tone={checkpoint.tone} variant="soft" size="sm">
                                    {checkpoint.statusLabel}
                                </ToneBadge>
                                <span className="font-medium">{checkpoint.title}</span>
                                {checkpoint.notes.map(note => (
                                    <span key={note} className="text-xs text-muted-foreground">
                                        {note}
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {checkpoint.quote ?? texts.noQuote}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
            {view.applicable && (
                <div className="space-y-1 text-sm">
                    <p className="font-medium">{texts.capsTitle}</p>
                    {view.caps.length > 0 ? (
                        <ul className="list-disc space-y-0.5 pl-5">
                            {view.caps.map(line => (
                                <li key={line}>{line}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-muted-foreground">{texts.capsNone}</p>
                    )}
                </div>
            )}
            {view.usage && <p className="text-xs text-muted-foreground">{view.usage}</p>}
        </div>
    );
};
