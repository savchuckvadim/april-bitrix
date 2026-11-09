import { CircleCheck, Send } from 'lucide-react';
import { Card, CardContent } from '@workspace/ui/components/card';
import { ONE_FORM_FLOW } from '../model/hub';

/** Шаг появления пунктов «что система сделала сама», мс. */
const EFFECT_STAGGER_MS = 350;

/**
 * Главная иллюстрация раздела без скриншотов: менеджер отправил одну форму —
 * и список того, что система сделала сама, появляется по пункту. Анимация
 * отключается у тех, кто просил систему меньше двигать интерфейс.
 */
export function OneFormFlow() {
    return (
        <Card className="overflow-hidden py-0 shadow-2xl">
            <CardContent className="flex flex-col gap-5 p-6">
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {ONE_FORM_FLOW.formLabel}
                    </p>
                    <dl className="grid gap-2">
                        {ONE_FORM_FLOW.formFields.map(field => (
                            <div key={field.label} className="flex items-baseline justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2 text-sm">
                                <dt className="text-muted-foreground">{field.label}</dt>
                                <dd className="text-right font-medium text-foreground">{field.value}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                        <Send className="size-4" aria-hidden />
                        {ONE_FORM_FLOW.submit}
                    </div>
                </div>
                <div className="h-px bg-border" />
                <div>
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-success">
                        {ONE_FORM_FLOW.effectsTitle}
                    </p>
                    <ul className="flex flex-col gap-2">
                        {ONE_FORM_FLOW.effects.map((effect, index) => (
                            <li
                                key={effect}
                                className="flex items-center gap-3 text-sm text-foreground animate-in fade-in slide-in-from-left-2 fill-mode-both duration-500 motion-reduce:animate-none"
                                style={{ animationDelay: `${(index + 1) * EFFECT_STAGGER_MS}ms` }}
                            >
                                <CircleCheck className="size-4 shrink-0 text-success" aria-hidden />
                                {effect}
                            </li>
                        ))}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
