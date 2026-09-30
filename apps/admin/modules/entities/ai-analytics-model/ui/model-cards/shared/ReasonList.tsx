import { MODEL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { ModelCodeView } from '../../../lib/model-code-label.util';
import { CodeLabel } from './CodeLabel';

interface ReasonListProps {
    reasons: ModelCodeView[];
    title?: string;
}

/** Причины статуса или гейта; пусто — «причин нет». */
export const ReasonList = ({
    reasons,
    title = MODEL_TEXT.reasons,
}: ReasonListProps) => (
    <div className="space-y-1.5">
        <h4 className="text-sm font-medium">{title}</h4>
        {reasons.length === 0 ? (
            <p className="text-sm text-muted-foreground">{MODEL_TEXT.noReasons}</p>
        ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
                {reasons.map(reason => (
                    <li key={reason.code}>
                        <CodeLabel view={reason} />
                    </li>
                ))}
            </ul>
        )}
    </div>
);
