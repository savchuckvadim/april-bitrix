'use client';

import { ToneBadge } from '@workspace/april-ui';
import {
    AI_ALERT_NO_LINK_TEXT,
    aiAlertKindView,
    formatAiMoment,
} from '@/modules/entities/ai-analytics';
import {
    AI_RISK_CALL_LINK_LABEL,
    AI_RISK_CALL_LINK_TITLE,
    AiCallTypeBadge,
    AiCardLink,
} from '@/modules/widgets/ai-analytics-report';
import type {
    AiEmployeeLowCall,
    AiEmployeeRiskCall,
} from '../../lib/ai-employee-calls.util';
import { AI_EMPLOYEE_TEXT } from '../../lib/ai-employee.texts';

const T = AI_EMPLOYEE_TEXT.calls;

/** Ссылка «разбор» на карточку в Битрикс24 либо подпись «разбор ещё не создан». */
const CallLink = ({ link }: { link: string | null }) =>
    link ? (
        <AiCardLink
            href={link}
            label={AI_RISK_CALL_LINK_LABEL}
            title={AI_RISK_CALL_LINK_TITLE}
        />
    ) : (
        <span className="text-xs text-muted-foreground">{AI_ALERT_NO_LINK_TEXT}</span>
    );

/** Риск-звонок: вид сигнала, время, «отработано», цитата (если есть), ссылка на разбор. */
export const AiEmployeeRiskCallRow = ({ call }: { call: AiEmployeeRiskCall }) => {
    // Старый кэш может нести вид, которого в словаре больше нет — запасная подпись.
    const kind = aiAlertKindView(call.kind);
    return (
        <li className="space-y-1 rounded-md border border-border/60 p-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <ToneBadge tone={kind.tone} variant="soft" size="sm">
                    {kind.label}
                </ToneBadge>
                <span className="text-muted-foreground">
                    {formatAiMoment(call.callStartedAt)}
                </span>
                {call.handled && (
                    <ToneBadge tone="success" variant="soft" size="sm">
                        {T.risk.handled}
                    </ToneBadge>
                )}
                <CallLink link={call.link} />
            </div>
            {call.quote ? (
                <blockquote className="border-l-2 border-muted-foreground/40 pl-3 text-sm italic text-muted-foreground">
                    «{call.quote}»
                </blockquote>
            ) : (
                <p className="text-xs text-muted-foreground">{T.risk.noQuote}</p>
            )}
        </li>
    );
};

/** Звонок с низкой оценкой: тип, оценка, ссылка на разбор. */
export const AiEmployeeLowCallRow = ({ call }: { call: AiEmployeeLowCall }) => (
    <li className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 p-2 text-xs">
        {call.callType && <AiCallTypeBadge code={call.callType} />}
        <span className="font-medium">{T.low.score(call.score)}</span>
        <CallLink link={call.link} />
    </li>
);
