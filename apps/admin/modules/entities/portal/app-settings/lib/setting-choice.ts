import type { PortalAppSettingOption, PortalAppSettingValue } from '../model';

/**
 * Настройка-выбор: одно значение из справочника `options` бэка (без
 * `isList`). В JSON портала лежит код опции строкой; `null` — ключ не задан,
 * действует дефолт кода. Сборка пунктов селекта живёт здесь, чтобы UI
 * оставался вёрсткой, а правила — проверяемыми.
 */

/** Служебное значение пункта «По умолчанию» (Radix Select не терпит ''). */
export const CHOICE_DEFAULT = '__default__';

export interface SettingChoiceItem {
    value: string;
    label: string;
}

interface ChoiceTexts {
    /** «По умолчанию». */
    defaultHint: string;
    /** Пометка значения, которого нет в справочнике. */
    foreignHint: string;
}

/** Текущее значение → значение селекта. */
export const toChoiceValue = (current: PortalAppSettingValue): string =>
    current === null ? CHOICE_DEFAULT : String(current);

/** Значение селекта → значение настройки (`null` = сбросить на дефолт). */
export const fromChoiceValue = (value: string): PortalAppSettingValue =>
    value === CHOICE_DEFAULT ? null : value;

/**
 * Пункты селекта: «По умолчанию (<имя дефолтной опции>)», затем справочник.
 * Значение, которого в справочнике нет (поставил прежний релиз бэка или
 * вписали руками), показывается отдельным пунктом с пометкой — стирать
 * чужой выбор молча нельзя.
 */
export const buildChoiceItems = (
    options: readonly PortalAppSettingOption[],
    defaultCode: unknown,
    current: PortalAppSettingValue,
    texts: ChoiceTexts,
): SettingChoiceItem[] => {
    const defaultName =
        options.find(option => option.code === String(defaultCode))?.name ??
        String(defaultCode);
    const items: SettingChoiceItem[] = [
        { value: CHOICE_DEFAULT, label: `${texts.defaultHint} (${defaultName})` },
        ...options.map(option => ({ value: option.code, label: option.name })),
    ];
    const currentCode = toChoiceValue(current);
    if (
        currentCode !== CHOICE_DEFAULT &&
        !options.some(option => option.code === currentCode)
    ) {
        items.push({
            value: currentCode,
            label: `${currentCode} ${texts.foreignHint}`,
        });
    }
    return items;
};
