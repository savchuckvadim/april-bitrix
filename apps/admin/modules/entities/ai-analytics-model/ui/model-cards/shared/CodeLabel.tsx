import { MODEL_TEXT } from '../../../consts/ai-analytics-model.const';
import type { ModelCodeView } from '../../../lib/model-code-label.util';

/**
 * Подпись кода бэка и сам код мелким моноширинным — раздел для
 * разработчика. Неизвестный код подсвечен и объяснён во всплывающем title.
 */
export const CodeLabel = ({ view }: { view: ModelCodeView }) => (
    <span
        className="inline-flex flex-wrap items-baseline gap-x-1.5"
        title={view.known ? undefined : MODEL_TEXT.unknownCode}
    >
        <span className={view.known ? undefined : 'text-warning'}>
            {view.label}
        </span>
        <code className="text-xs text-muted-foreground">{view.code}</code>
    </span>
);
