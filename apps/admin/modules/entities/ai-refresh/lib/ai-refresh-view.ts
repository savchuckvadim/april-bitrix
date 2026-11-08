import type {
    AiRefreshScenarioDto,
    AiRefreshStepDto,
} from '@workspace/nest-admin-api';
import { AI_REFRESH_TEXT as TEXT } from '../consts/ai-refresh.const';

/** Итог сценария одной строкой и его цвет. */
export interface AiRefreshSummary {
    text: string;
    tone: 'info' | 'success' | 'warning';
}

/** Текущий шаг: идёт или ждёт очереди; всё кончилось — null. */
export function currentStepOf(
    scenario: AiRefreshScenarioDto,
): AiRefreshStepDto | null {
    return (
        scenario.steps.find(
            step => step.state === 'running' || step.state === 'pending',
        ) ?? null
    );
}

/** «Идёт шаг 2 из 5» / «Закончено» / «…есть сорвавшиеся шаги». */
export function summaryOf(scenario: AiRefreshScenarioDto): AiRefreshSummary {
    if (!scenario.finished) {
        const current = currentStepOf(scenario);
        const index = current ? scenario.steps.indexOf(current) + 1 : 0;
        return {
            text: `${TEXT.running(index, scenario.steps.length)}: ${current?.title ?? ''}`,
            tone: 'info',
        };
    }
    return scenario.steps.some(step => step.state === 'error')
        ? { text: TEXT.finishedWithErrors, tone: 'warning' }
        : { text: TEXT.finished, tone: 'success' };
}

/** «08.11, 17:40» по ISO в часовом поясе браузера. */
export function shortDateTime(iso: string): string {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
