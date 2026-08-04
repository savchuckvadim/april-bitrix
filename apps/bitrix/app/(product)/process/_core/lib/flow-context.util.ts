/**
 * Привязка шага детального процесса к текущей конфигурации.
 *
 * Без этого схема живёт своей жизнью: заказчик крутит ползунки, отвечает на
 * вопросы — а процесс внизу выглядит одинаково. Здесь шаг подхватывает и
 * сущность (лид/сделка), и исполнителя из той же модели, что рисует хребет.
 */

import { callsPlacementName } from './calls-placement.util';
import type {
    FlowStep,
    ProcessActor,
    ProcessModel,
    StageOwner,
} from '../types';

export interface FlowStepContext {
    /** Где происходит шаг: в лиде, в сделке, в обоих или это цикл. */
    owner: StageOwner | null;
    /** Подпись места: «в лиде», «в сделке», «в лиде и сделке». */
    placeLabel: string;
    /** Кто делает — с учётом ответов на вопросы. */
    actor: ProcessActor | null;
}

const OWNER_PLACE: Record<StageOwner, string> = {
    lead: 'в лиде',
    deal: 'в сделке',
    both: 'в лиде и сделке',
    none: 'нигде не ведётся',
};

/** Место работы менеджера в цикле — оно же место приложения «Звонки». */
const cyclePlace = (model: ProcessModel): string => {
    const { inLead, inDeal, isSplit } = model.callsApp;
    if (isSplit) return 'в лиде и сделке';
    if (inLead) return 'в лиде';
    if (inDeal) return 'в сделке';
    return callsPlacementName(model.callsApp);
};

export const resolveFlowStepContext = (
    model: ProcessModel,
    step: FlowStep,
): FlowStepContext => {
    /**
     * Ответ про сам шаг сильнее исполнителя стадии: «кто первым смотрит лид» и
     * «кто пытается определить ИНН» — разные вопросы об одной стадии.
     */
    const answered = model.stepActors.get(step.id) ?? null;

    if (!step.stageId) {
        return {
            owner: null,
            placeLabel: cyclePlace(model),
            actor: answered ?? step.actor ?? null,
        };
    }

    const view = model.stages.find(item => item.stage.id === step.stageId);
    if (!view) {
        return {
            owner: null,
            placeLabel: '—',
            actor: answered ?? step.actor ?? null,
        };
    }

    return {
        owner: view.owner,
        placeLabel: OWNER_PLACE[view.owner],
        // Исполнитель стадии уже учитывает ответы на вопросы.
        actor: answered ?? view.actor,
    };
};
