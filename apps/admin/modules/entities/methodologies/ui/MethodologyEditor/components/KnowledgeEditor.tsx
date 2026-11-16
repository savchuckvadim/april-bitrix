'use client';

import { Button } from '@workspace/ui/components/button';
import { Switch } from '@workspace/ui/components/switch';
import {
    isOwnLayer,
    setKnowledgeLayer,
    toggleKnowledge,
} from '../../../lib/methodology-materials.util';
import {
    METHODOLOGY_KNOWLEDGE_TEXT,
    type CatalogKnowledgeKind,
    type MethodologyKnowledge,
} from '../../../model/methodology-materials';

interface KnowledgeEditorProps {
    knowledge: MethodologyKnowledge;
    kinds: CatalogKnowledgeKind[];
    /** Код методики — слой «документ этой методики». */
    methodologyCode: string;
    /** undefined — ничего не отмечено, поле уходит из конфига. */
    onChange: (next: MethodologyKnowledge | undefined) => void;
}

/**
 * Материалы методики: какие виды базы знаний читает её проход и сколько
 * знаков каждого вида помещается в запрос. Пределы — из каталога формы, те
 * же числа, по которым материалы режет разбор.
 */
export const KnowledgeEditor = ({
    knowledge,
    kinds,
    methodologyCode,
    onChange,
}: KnowledgeEditorProps) => {
    const texts = METHODOLOGY_KNOWLEDGE_TEXT;
    const known = new Set(kinds.map(item => item.kind));
    const unknown = Object.keys(knowledge).filter(kind => !known.has(kind));

    if (kinds.length === 0 && unknown.length === 0) {
        return <p className="text-sm text-muted-foreground">{texts.noKinds}</p>;
    }
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{texts.intro}</p>
            <div className="space-y-2">
                {kinds.map(item => {
                    const enabled = knowledge[item.kind] !== undefined;
                    return (
                        <div
                            key={item.kind}
                            className="space-y-2 rounded-lg border border-border/70 p-3"
                        >
                            <label className="flex items-start gap-3">
                                <Switch
                                    checked={enabled}
                                    onCheckedChange={checked =>
                                        onChange(
                                            toggleKnowledge(knowledge, item.kind, checked),
                                        )
                                    }
                                />
                                <span className="space-y-0.5">
                                    <span className="block font-medium">{item.title}</span>
                                    <span className="block text-xs text-muted-foreground">
                                        {item.kind} ·{' '}
                                        {texts.budget(
                                            item.budgetChars.toLocaleString('ru-RU'),
                                        )}
                                    </span>
                                    {item.presentationOnly && (
                                        <span className="block text-xs text-muted-foreground">
                                            {texts.presentationOnly}
                                        </span>
                                    )}
                                </span>
                            </label>
                            {enabled && (
                                <label className="flex items-center gap-2 pl-12 text-sm">
                                    <Switch
                                        checked={isOwnLayer(knowledge, item.kind)}
                                        disabled={!methodologyCode}
                                        onCheckedChange={own =>
                                            onChange(
                                                setKnowledgeLayer(
                                                    knowledge,
                                                    item.kind,
                                                    own,
                                                    methodologyCode,
                                                ),
                                            )
                                        }
                                    />
                                    {texts.layer}:{' '}
                                    {isOwnLayer(knowledge, item.kind)
                                        ? texts.layerOwn
                                        : texts.layerShared}
                                </label>
                            )}
                        </div>
                    );
                })}
                {unknown.map(kind => (
                    <div
                        key={kind}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border/70 p-3 text-sm"
                    >
                        <span>
                            {kind}{' '}
                            <span className="text-xs text-muted-foreground">
                                — {texts.unknown}
                            </span>
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onChange(toggleKnowledge(knowledge, kind, false))}
                        >
                            {texts.remove}
                        </Button>
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">{texts.volumeHint}</p>
        </div>
    );
};
