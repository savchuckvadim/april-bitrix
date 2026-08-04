'use client';

import type { FC } from 'react';
import { findEventType } from '../../constants/sim-events';
import { satelliteStates } from '../../lib/satellites.util';
import type { SimState } from '../../lib/simulator.util';
import type {
    ProcessDefinition,
    ProcessModel,
    ProcessSatellite,
} from '../../types';
import { SimFunnelRow } from './SimFunnelRow';
import type { FunnelStageMark } from './SimFunnelRow';

interface SimFunnelsProps {
    state: SimState;
    definition: ProcessDefinition;
    model: ProcessModel;
}

const satelliteMarks = (satellite: ProcessSatellite): FunnelStageMark[] =>
    satellite.stages.map(stage => ({
        code: stage.id,
        label: stage.label,
        color: stage.color,
        isTerminal: stage.isTerminal,
    }));

const indexOfStage = (satellite: ProcessSatellite, stageId: string): number =>
    satellite.stages.findIndex(stage => stage.id === stageId);

/**
 * Прогресс по всем воронкам сразу.
 *
 * В любой момент у клиента живёт набор сущностей, и каждая стоит на своей
 * стадии: основная сделка ползёт по лестнице, спутник холодного обзвона
 * закрывается после первого же отчёта, сделки-презентаций заводятся под каждое
 * событие. Одна строка на сущность — иначе понять, что происходит, невозможно.
 *
 * Набор строк зависит от конфигурации: нет отдела ТМЦ — нет и его воронки; лид
 * не участвует — нет его строки.
 */
export const SimFunnels: FC<SimFunnelsProps> = ({
    state,
    definition,
    model,
}) => {
    const stageView = model.stages[state.stageIndex];
    const hasReportedOnce = state.log.length > 0;
    const isClosed = state.status === 'sale' || state.status === 'fail';

    // Состояние спутников считается чистой функцией: их правила закрытия —
    // часть домена, а не оформления, и должны проверяться тестами.
    /**
     * До передачи в работу существует только лид. Сделку, спутника холодного
     * обзвона и задачу заводит один и тот же хук — показывать их раньше
     * значит рисовать сущности, которых ещё нет.
     */
    const satellites = state.isHandedOver
        ? satelliteStates(model.satellites, state)
        : [];

    const presDone = state.log.reduce(
        (sum, entry) =>
            sum +
            entry.kpi.filter(record => record.label === 'Презентация проведена')
                .length,
        0,
    );

    return (
        <section className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-foreground text-sm font-bold tracking-widest uppercase">
                    Где сейчас какая сущность
                </h3>
                <p className="text-muted-foreground text-xs">
                    деления — стадии воронки, цвета настоящие из портала ·
                    наведите на деление
                </p>
                {presDone > 0 && (
                    <p className="text-success text-xs font-semibold">
                        проведено презентаций: {presDone}
                    </p>
                )}
            </div>

            <ul className="space-y-1.5">
                {stageView?.isLeadCovered && (
                    <SimFunnelRow
                        label="Лид"
                        stages={[
                            { code: 'new', label: 'Новый', color: '#3bc8f5' },
                            {
                                code: 'work',
                                label: 'В работе',
                                color: '#0ec96f',
                            },
                            {
                                code: 'demo',
                                label: 'Демонстрация',
                                color: '#fff300',
                            },
                            {
                                code: 'converted',
                                label: 'Сконвертирован',
                                color: '#00ff00',
                                isTerminal: true,
                            },
                        ]}
                        currentIndex={hasReportedOnce ? 2 : 1}
                        isClosed={false}
                    />
                )}

                {state.isHandedOver && (
                    <SimFunnelRow
                        label="ОП Основная"
                        stages={definition.stages.map(stage => ({
                            code: stage.id,
                            label: stage.label,
                            color: stage.color,
                            isTerminal: stage.isClosing,
                        }))}
                        currentIndex={state.stageIndex}
                        isClosed={
                            state.status === 'sale' || state.status === 'fail'
                        }
                    />
                )}

                {!state.isHandedOver && (
                    <li className="text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-xs leading-relaxed">
                        Пока только лид. Сделка, воронка холодного обзвона и
                        первая задача появятся разом — их создаёт хук в момент
                        передачи менеджеру.
                    </li>
                )}

                {satellites.map(item => (
                    <SimFunnelRow
                        key={item.satellite.id}
                        label={
                            item.count > 1
                                ? `${item.satellite.label} · ${item.count} шт.`
                                : item.satellite.label
                        }
                        stages={satelliteMarks(item.satellite)}
                        currentIndex={indexOfStage(
                            item.satellite,
                            item.stageId,
                        )}
                        isClosed={item.isClosed}
                        hint={item.reason}
                    />
                ))}
            </ul>

            {isClosed && (
                <p className="text-muted-foreground text-xs leading-relaxed">
                    Исход закрывает всё: основная сделка встала в
                    {state.status === 'sale' ? ' «Успех»' : ' «Отказ»'}, а
                    каждая дополнительная воронка — на свою терминальную стадию,
                    по своему условию. Наведите на строку, чтобы увидеть, по
                    какому именно.
                </p>
            )}

            {!isClosed && state.tasks.length > 1 && (
                <p className="text-muted-foreground text-xs">
                    Дел открыто несколько, и каждое уже подняло сделку по
                    лестнице: стадия равна максимуму из запланированного —
                    понизить её нельзя.{' '}
                    {state.tasks
                        .map(task => findEventType(task.eventCode)?.label)
                        .filter(Boolean)
                        .join(' · ')}
                </p>
            )}
        </section>
    );
};
