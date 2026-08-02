/**
 * Сборка текстового регламента работы по выбранной конфигурации.
 *
 * Это главный артефакт страницы: заказчик крутит крутилки, отвечает на вопросы
 * и уносит с собой готовый документ — что где происходит, кто за что отвечает
 * и что система делает сама. Ничего не выдумываем: весь текст собран из тех же
 * констант, что рисуют схему, а они сверены с кодом.
 */

import { SALES_FLOW } from '../constants/sales-flow';
import { SALES_QUESTIONS } from '../constants/questions';
import { ACTOR_LABEL } from '../lib/actor.util';
import { callsPlacementName } from '../lib/calls-placement.util';
import { resolveFlowStepContext } from '../lib/flow-context.util';
import { KPI_BADGE_LABEL, KPI_SOURCE_HINT } from '../lib/kpi-source.util';
import { openDecisions } from '../lib/open-decisions.util';
import { plural } from '../lib/plural.util';
import type {
    ProcessConfig,
    ProcessDefinition,
    ProcessModel,
    ProcessPreset,
} from '../types';
import { buildVerdict } from './verdict';

const RULE = '─'.repeat(64);

const section = (title: string): string[] => [
    '',
    RULE,
    title.toUpperCase(),
    RULE,
    '',
];

const numbered = (items: string[]): string[] =>
    items.map((item, index) => `${index + 1}. ${item}`);

const bulleted = (items: string[]): string[] =>
    items.map(item => `   • ${item}`);

/**
 * Где какая сущность ведёт работу — таблицей по стадиям.
 * Ширину колонок считаем от данных, включая заголовок: иначе шапка разъезжается
 * с телом на моноширинном шрифте.
 */
const coverageLines = (model: ProcessModel): string[] => {
    const owner = {
        lead: 'Лид',
        deal: 'Сделка',
        both: 'Лид и Сделка',
        none: '— никто —',
    } as const;

    const stageWidth = Math.max(
        'Стадия'.length,
        ...model.stages.map(view => view.stage.label.length),
    );
    const ownerWidth = Math.max(
        'Сущность'.length,
        ...model.stages.map(view => owner[view.owner].length),
    );

    const row = (stage: string, entity: string, actor: string, marks = '') =>
        `   ${stage.padEnd(stageWidth)}   ${entity.padEnd(ownerWidth)}   ${actor}${
            marks ? `   ${marks}` : ''
        }`.trimEnd();

    return [
        row('Стадия', 'Сущность', 'Ведёт'),
        ...model.stages.map(view =>
            row(
                view.stage.label,
                owner[view.owner],
                ACTOR_LABEL[view.actor],
                [
                    view.writesKpi ? KPI_BADGE_LABEL[model.kpiSource] : '',
                    view.isBlockedForLead
                        ? 'лид не допускается регламентом'
                        : '',
                ]
                    .filter(Boolean)
                    .join(', '),
            ),
        ),
    ];
};

const answerLines = (config: ProcessConfig): string[] =>
    SALES_QUESTIONS.filter(question => question.isActive).map(question => {
        const chosen = question.options.find(
            option => option.code === config.answers[question.id],
        );

        return chosen
            ? `${question.title}\n   → ${chosen.label}`
            : `${question.title}\n   → НЕ ВЫБРАНО`;
    });

const flowLines = (model: ProcessModel): string[] => {
    const placement = callsPlacementName(model.callsApp);
    const exitActors = new Map(
        model.exits
            .filter(exit => exit.actor)
            .map(exit => [exit.id, exit.actor!] as const),
    );

    return SALES_FLOW.flatMap((phase, phaseIndex) => {
        const lines = [
            `${phaseIndex + 1}. ${phase.title.toUpperCase()} — ${phase.subtitle}`,
            '',
        ];

        phase.steps.forEach(step => {
            const wip = step.readiness === 'wip' ? '  [в разработке]' : '';
            // Исполнителя берём разрешённым: он зависит от ответов в пульте,
            // а не от того, что зашито в константе шага.
            const actor = resolveFlowStepContext(model, step).actor;
            const who = actor ? `  (${ACTOR_LABEL[actor]})` : '';
            const label = step.followsCallsPlacement
                ? `${step.label} — ${placement}`
                : step.label;

            lines.push(`   ${label}${who}${wip}`);
            if (step.hint) lines.push(`      ${step.hint}`);

            if (step.systemDoes) {
                step.systemDoes.forEach(item => lines.push(`      • ${item}`));
            }

            step.branches?.forEach(branch => {
                const decider = branch.exitId
                    ? exitActors.get(branch.exitId)
                    : undefined;
                const suffix = decider
                    ? ` (решает ${ACTOR_LABEL[decider].toLowerCase()})`
                    : '';
                const branchWip =
                    branch.readiness === 'wip' ? '  [в разработке]' : '';

                lines.push(`      ├─ ${branch.label}${suffix}${branchWip}`);
                lines.push(`      │  ${branch.text}`);
            });

            lines.push('');
        });

        return lines;
    });
};

export interface RegulationInput {
    definition: ProcessDefinition;
    model: ProcessModel;
    config: ProcessConfig;
    preset: ProcessPreset | null;
    /** Дата формирования — передаём снаружи, чтобы функция осталась чистой. */
    date: string;
    company?: string;
}

/** Собирает готовый к печати регламент работы отдела продаж. */
export const buildRegulation = ({
    definition,
    model,
    config,
    preset,
    date,
    company,
}: RegulationInput): string => {
    const verdict = buildVerdict(definition, model);

    const lines: string[] = [
        'РЕГЛАМЕНТ РАБОТЫ ОТДЕЛА ПРОДАЖ',
        definition.title,
        '',
        `Организация: ${company?.trim() || '—'}`,
        `Дата: ${date}`,
        `Схема: ${preset ? preset.label : 'своя комбинация'} — лид ${config.leadPct} %, сделка ${config.dealPct} %`,

        ...section('1. Где ведётся работа'),
        verdict.headline,
        '',
        verdict.workplace,
    ];

    if (verdict.gain.length) {
        lines.push('', 'Что выигрываем:', ...bulleted(verdict.gain));
    }
    if (verdict.price.length) {
        lines.push('', 'Чем платим:', ...bulleted(verdict.price));
    }

    lines.push(
        `Источник цифр отчётности: ${KPI_BADGE_LABEL[model.kpiSource]}.`,
        `   ${KPI_SOURCE_HINT[model.kpiSource]}`,

        ...section('2. Стадии и ответственные'),
        ...coverageLines(model),
    );

    // Про потолок пишем, только когда он реально сработал: если крутилка лида
    // и так не достаёт до него, упоминание лишь путает.
    const isCapBinding = model.stages.some(view => view.isBlockedForLead);
    if (model.leadCapStageId && isCapBinding) {
        const capped = definition.stages.find(
            stage => stage.id === model.leadCapStageId,
        );
        lines.push(
            '',
            `Регламент: дальше стадии «${capped?.label}» работа в лиде не ведётся, даже если выкрутить крутилку лида на максимум.`,
        );
    }

    if (model.overlapCount > 0) {
        lines.push(
            '',
            `Перекрытие: ${model.overlapCount} ${plural(
                model.overlapCount,
                'стадия ведётся',
                'стадии ведутся',
                'стадий ведутся',
            )} одновременно в лиде и в сделке.`,
        );
    }
    if (model.gapCount > 0) {
        lines.push(
            '',
            `ВНИМАНИЕ: ${model.gapCount} ${plural(
                model.gapCount,
                'стадия не ведётся',
                'стадии не ведутся',
                'стадий не ведутся',
            )} ни одной сущностью.`,
        );
    }

    lines.push(
        ...section('3. Принятые решения'),
        ...numbered(answerLines(config)),

        ...section('4. Процесс целиком'),
        ...flowLines(model),

        ...section('5. Параллельные воронки'),
    );

    model.satellites.forEach(satellite => {
        lines.push(
            `${satellite.label} (${satellite.categoryCode})`,
            `   ${satellite.summary}`,
            `   Стадии: ${satellite.stages.map(stage => stage.label).join(' → ')}`,
            `   Связь: ${satellite.link}`,
            '',
        );
    });

    lines.push(
        ...section('6. Куда можно свернуть'),
        ...model.exits.map(exit => {
            const who = exit.actor
                ? ` — решает ${ACTOR_LABEL[exit.actor].toLowerCase()}`
                : '';
            const wip = exit.readiness === 'wip' ? '  [в разработке]' : '';
            return `   ${exit.label}${who}${wip}${exit.hint ? `\n      ${exit.hint}` : ''}`;
        }),
    );

    const open = openDecisions(definition.theory);

    if (open.length > 0) {
        lines.push(
            ...section('7. Открытые развилки — решить на внедрении'),
            'Здесь у нас пока нет готового ответа. Это не пробел в документе, а',
            'честно открытый вопрос: решать его лучше сейчас и спокойно, чем',
            'через полгода конфликтом.',
            '',
        );

        open.forEach((decision, index) => {
            lines.push(
                `${index + 1}. ${decision.question}`,
                `   Разобрано подробно: «${decision.source}».`,
                ...bulleted(decision.positions),
                `   Чем платим: ${decision.price}`,
                '',
            );
        });
    }

    lines.push(
        '',
        RULE,
        'Пометка «в разработке» означает: механика описана в проекте, но в коде',
        'её пока нет. Всё остальное в этом документе работает сегодня.',
        '',
        'Сформировано на странице «Процесс продажи» — конфигуратор внедрения.',
    );

    return lines.join('\n');
};
