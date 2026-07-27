import type { RTableAnnotation } from '@workspace/april-ui';
import type { ConversionMethod } from '../model/conversion.types';
import {
    buildMedianByCode,
    ConversionResult,
    ConversionStep,
    formatPercent,
} from './conversion-calc.util';
import {
    conversionTextClass,
    getConversionIntent,
} from './conversion-intent.util';
import { CONVERSION_METHOD_HINTS } from './conversion-catalog';

/**
 * Человекочитаемое пояснение значения конверсии для тултипа ячейки:
 * что на что делится («из M „From“ — N „To“»), медиана команды для
 * контекста раскраски и метод подсчёта (chain/fromBase меняют смысл).
 */
export const buildConversionTooltip = (
    step: ConversionStep,
    median: ConversionStep | undefined,
    method: ConversionMethod,
): string => {
    const lines: string[] = [];
    if (step.percent === null) {
        lines.push(
            `Нет базы: за период нет «${step.fromName}» (знаменатель 0)`,
        );
    } else {
        lines.push(
            `${step.numerator} из ${step.denominator}: ` +
                `из ${step.denominator} «${step.fromName}» — ` +
                `${step.numerator} «${step.toName}»`,
        );
    }
    if (median?.percent !== null && median?.percent !== undefined) {
        lines.push(`Медиана команды: ${formatPercent(median.percent)}`);
    }
    lines.push(`Метод: ${CONVERSION_METHOD_HINTS[method].toLowerCase()}`);
    return lines.join('\n');
};

/**
 * Аннотации ячеек основных таблиц: % конверсии показателя-приёмника
 * (`${userId}:${toCode}`), раскраска относительно медианы команды +
 * тултип-пояснение (что делится на что и каким методом).
 * Медиана глобальная (по всему отфильтрованному отчёту), поэтому карта
 * переиспользуется и секциями разбивки.
 */
export const buildConversionAnnotations = (
    result: ConversionResult,
    method: ConversionMethod,
): Map<string, RTableAnnotation> => {
    const medianByCode = buildMedianByCode(result);
    const annotations = new Map<string, RTableAnnotation>();
    result.rows.forEach(row =>
        row.steps.forEach(step => {
            const median = medianByCode.get(step.toCode);
            annotations.set(`${row.userId}:${step.toCode}`, {
                text: formatPercent(step.percent),
                className: conversionTextClass(
                    getConversionIntent(step, median),
                ),
                tooltip: buildConversionTooltip(step, median, method),
            });
        }),
    );
    return annotations;
};
