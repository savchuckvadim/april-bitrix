'use client';

import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@workspace/ui/components/select';
import { APP_SETTINGS_TEXT } from '../../../consts/app-settings.const';
import type {
    PortalAppSettingDescriptor,
    PortalAppSettingValue,
} from '../../../model';
import { AppSettingListField } from './AppSettingListField';

interface AppSettingFieldProps {
    descriptor: PortalAppSettingDescriptor;
    /** Черновик формы: undefined = не менялось, null = сброс на дефолт. */
    draft: PortalAppSettingValue | undefined;
    onChange: (value: PortalAppSettingValue) => void;
}

/** Трёхсостояние булевой настройки (Radix Select не терпит ''). */
type BoolTriState = 'default' | 'on' | 'off';

const toTriState = (value: PortalAppSettingValue | undefined): BoolTriState =>
    value === null || value === undefined ? 'default' : value ? 'on' : 'off';

/**
 * Одно поле настройки: тип берётся из дескриптора бэка (boolean —
 * трёхсостоянный селект, number/string — input с плейсхолдером дефолта).
 * Пустой input и «По умолчанию» = null → бэк сбрасывает ключ на дефолт.
 */
/** Generated-тип value/default шире рантайма — нормализуем к скалярам. */
const normalizeValue = (raw: unknown): PortalAppSettingValue =>
    typeof raw === 'boolean' ||
    typeof raw === 'number' ||
    typeof raw === 'string'
        ? raw
        : null;

export const AppSettingField = ({
    descriptor,
    draft,
    onChange,
}: AppSettingFieldProps) => {
    // Текущее отображаемое значение: черновик приоритетнее сохранённого.
    const effective =
        draft !== undefined ? draft : normalizeValue(descriptor.value);
    /**
     * «Настроено» = ключ реально лежит в JSON портала.
     *
     * Признак приходит с бэка отдельным полем `stored` — тем самым, что
     * фрейм получает списком `storedKeys`. По значению это не вычисляется:
     * заданное на портале значение может совпасть с дефолтом кода, и
     * «настроено» пропало бы с экрана, хотя ключ никуда не делся.
     * Несохранённый черновик считается по себе: `null` в нём — это и есть
     * «сбросить на дефолт».
     *
     * Запасной путь для СТАРОГО бэка, где поля `stored` ещё нет: прежняя
     * эвристика по значению. Без него все настройки портала разом стали бы
     * «по умолчанию», хотя владелец их задавал. Убрать вместе с ветками
     * старого бэка во фрейме, когда обновятся все стенды.
     */
    const isCustomized =
        draft !== undefined
            ? draft !== null
            : (descriptor.stored ?? descriptor.value !== null);

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <Label>{descriptor.name}</Label>
                <span
                    className={
                        isCustomized
                            ? 'rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600'
                            : 'rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'
                    }
                >
                    {isCustomized ? 'настроено' : 'по умолчанию'}
                </span>
            </div>

            {descriptor.isList && descriptor.options?.length ? (
                /* Настройка-список: коды берутся из справочника бэка, а не
                   набираются руками — опечатка в CSV молча означала бы
                   «ничего не выбрано». */
                <AppSettingListField
                    options={descriptor.options}
                    value={effective}
                    onChange={onChange}
                />
            ) : descriptor.type === 'boolean' ? (
                <Select
                    value={toTriState(effective)}
                    onValueChange={state =>
                        onChange(state === 'default' ? null : state === 'on')
                    }
                >
                    <SelectTrigger className="w-56">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="default">
                            {APP_SETTINGS_TEXT.defaultHint} (
                            {descriptor.default ? 'вкл' : 'выкл'})
                        </SelectItem>
                        <SelectItem value="on">Включено</SelectItem>
                        <SelectItem value="off">Выключено</SelectItem>
                    </SelectContent>
                </Select>
            ) : (
                <div className="flex items-center gap-2">
                    <Input
                        className="w-56"
                        inputMode={
                            descriptor.type === 'number' ? 'numeric' : 'text'
                        }
                        placeholder={`${APP_SETTINGS_TEXT.defaultHint}: ${String(descriptor.default)}`}
                        value={effective === null ? '' : String(effective)}
                        onChange={event => {
                            const raw = event.target.value;
                            if (raw === '') {
                                onChange(null);
                                return;
                            }
                            onChange(
                                descriptor.type === 'number'
                                    ? Number(raw)
                                    : raw,
                            );
                        }}
                    />
                    {effective !== null && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            title={APP_SETTINGS_TEXT.resetToDefault}
                            onClick={() => onChange(null)}
                        >
                            ⟲
                        </Button>
                    )}
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                {descriptor.description}
            </p>
        </div>
    );
};
