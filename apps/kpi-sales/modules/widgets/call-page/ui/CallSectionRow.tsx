import { ToneBadge } from '@workspace/april-ui/badges';
import {
    formatScore,
    scoreTone,
    type CallPageSectionDto,
} from '@/modules/entities/call-page';

const LABEL = 'font-medium text-muted-foreground';

/** Один раздел разговора: оценка, разбор, «как было» и «как стоило». */
export const CallSectionRow = ({ section }: { section: CallPageSectionDto }) => (
    <li className="space-y-1 border-t border-border pt-3 first:border-t-0 first:pt-0">
        <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium">{section.title}</h3>
            {section.score !== null && (
                <ToneBadge tone={scoreTone(section.score)} variant="soft">
                    {formatScore(section.score)} из 10
                </ToneBadge>
            )}
        </div>
        {section.analysis && <p>{section.analysis}</p>}
        {section.asWas && (
            <p>
                <span className={LABEL}>Как было: </span>
                {section.asWas}
            </p>
        )}
        {section.weaknesses && (
            <p>
                <span className={LABEL}>Что слабо: </span>
                {section.weaknesses}
            </p>
        )}
        {section.advice && (
            <p>
                <span className={LABEL}>Как стоило: </span>
                {section.advice}
            </p>
        )}
        {section.alternatives.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5 text-muted-foreground">
                {section.alternatives.map(item => (
                    <li key={item}>{item}</li>
                ))}
            </ul>
        )}
    </li>
);
