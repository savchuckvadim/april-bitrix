'use client';

import { useState } from 'react';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Input } from '@workspace/ui/components/input';
import { usePortal } from '@/modules/entities/portal/hooks';
import { useQuestionnaireFields } from '@/modules/entities/portal/questionnaires';
import {
    type BitrixFieldEntity,
    missingFieldNames,
    orderPickableFields,
    parseFieldNames,
} from '../../../lib/setting-bitrix-fields';
import { formatSettingList } from '../../../lib/setting-list';
import type { PortalAppSettingValue } from '../../../model';

interface AppSettingBitrixFieldsFieldProps {
    portalId: number;
    /** Чьи поля выбираются — по `pick` дескриптора. */
    entity: BitrixFieldEntity;
    /** Действующее значение: CSV UF-имён либо null (не задано). */
    value: PortalAppSettingValue;
    onChange: (value: PortalAppSettingValue) => void;
}

/** Сколько полей показывать без поиска: у старых порталов их сотни. */
const LIST_LIMIT = 40;

/**
 * Настройка-поля портала: выбор из живых полей сущности (ручка анкет
 * `questionnaire-fields`), а не ввод UF-имён руками — опечатка в имени
 * молча означала бы «поле не читается».
 */
export const AppSettingBitrixFieldsField = ({
    portalId,
    entity,
    value,
    onChange,
}: AppSettingBitrixFieldsFieldProps) => {
    const [query, setQuery] = useState('');
    const portal = usePortal(portalId);
    const fields = useQuestionnaireFields(
        portalId,
        { entity },
        portal.data?.domain,
    );

    const selected = parseFieldNames(value);
    const picked = new Set(selected);
    const live = fields.data?.fields ?? [];
    const ordered = orderPickableFields(live, picked, query);
    const shown = ordered.slice(0, Math.max(LIST_LIMIT, picked.size));
    const hidden = ordered.length - shown.length;
    // Пока список не пришёл, «нет на портале» было бы неправдой.
    const missing = fields.isSuccess ? missingFieldNames(selected, live) : [];

    const toggle = (fieldName: string, isPicked: boolean) => {
        const name = fieldName.toUpperCase();
        const rest = selected.filter(item => item !== name);
        onChange(formatSettingList(isPicked ? [...rest, name] : rest));
    };

    return (
        <div className="w-full max-w-xl space-y-2">
            <Input
                placeholder="Поиск поля по названию или UF-имени"
                value={query}
                onChange={event => setQuery(event.target.value)}
            />
            {fields.isLoading || portal.isLoading ? (
                <p className="text-sm text-muted-foreground">
                    Загружаю поля портала…
                </p>
            ) : fields.isError ? (
                <p className="text-sm text-destructive">
                    Не удалось загрузить поля портала.
                </p>
            ) : fields.data?.degraded ? (
                <p className="text-sm text-amber-600">
                    {fields.data.error ?? 'Портал не ответил — поля не прочитаны.'}
                </p>
            ) : null}

            {shown.length > 0 && (
                <div className="max-h-64 space-y-1 overflow-y-auto rounded border p-2">
                    {shown.map(field => (
                        <label
                            key={field.fieldName}
                            className="flex items-center gap-2 text-sm"
                        >
                            <Checkbox
                                checked={picked.has(field.fieldName.toUpperCase())}
                                onCheckedChange={checked =>
                                    toggle(field.fieldName, checked === true)
                                }
                            />
                            <span>{field.title || field.fieldName}</span>
                            <code className="font-mono text-[11px] text-muted-foreground">
                                {field.fieldName}
                            </code>
                            {field.inPortalDb && (
                                <span className="text-[11px] text-muted-foreground">
                                    поле April
                                </span>
                            )}
                        </label>
                    ))}
                    {hidden > 0 && (
                        <p className="pt-1 text-xs text-muted-foreground">
                            Ещё полей: {hidden} — уточните поиск.
                        </p>
                    )}
                </div>
            )}

            {missing.length > 0 && (
                <div className="space-y-1">
                    <p className="text-xs text-amber-600">
                        Выбраны, но на портале таких полей нет — удалены или
                        переименованы:
                    </p>
                    {missing.map(name => (
                        <label key={name} className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked
                                onCheckedChange={() => toggle(name, false)}
                            />
                            <code className="font-mono text-[11px]">{name}</code>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};
