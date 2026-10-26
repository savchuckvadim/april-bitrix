'use client';

import { FC } from 'react';
import { FieldErrorHint, HintTooltip } from '@workspace/april-ui';
import { ChipSelect } from '@workspace/april-ui/fields';
import { useAppDispatch, useAppSelector } from '@/modules/app/lib/hooks/redux';
import { selectClientTypeView } from '../lib/client-type-selectors';
import { clientTypeName } from '../lib/client-type-view';
import { saveClientType } from '../model/ClientTypeThunk';

/**
 * «Тип клиента» компактным чипом в шапке, рядом с ИНН (владелец 26.10.2026).
 *
 * Значение одно на клиента: выбор пишется и в компанию, и в открытую
 * сделку. Разные значения у сделки и компании — чип пустой с подсказкой
 * «выберите верный». Поля нет на портале — чипа нет (§5 доктрины).
 */
export const ClientTypeChip: FC = () => {
    const dispatch = useAppDispatch();
    const view = useAppSelector(selectClientTypeView);
    const isSaving = useAppSelector(s => s.clientType.isSaving);
    const error = useAppSelector(s => s.clientType.error);

    if (!view.available || !view.options.length) return null;

    const onChange = (raw: string) => {
        const option = view.options.find(item => item.code === raw);
        if (option) void dispatch(saveClientType(option.code));
    };

    const chip = (
        <ChipSelect
            value={view.conflict ? undefined : (view.current ?? undefined)}
            options={view.options}
            onChange={onChange}
            disabled={isSaving}
            ariaLabel="Тип клиента"
            placeholder={view.conflict ? 'Тип разный — выберите' : 'Тип клиента'}
            className={view.conflict ? 'border-warning/50' : undefined}
        />
    );

    return (
        <div className="relative">
            {view.conflict ? (
                <HintTooltip
                    title="Тип клиента в сделке и компании разный"
                    lines={[
                        `В сделке — «${clientTypeName(view.options, view.deal)}», ` +
                            `в компании — «${clientTypeName(view.options, view.company)}».`,
                        'Выберите верный — он запишется и в сделку, и в компанию.',
                    ]}
                >
                    <span>{chip}</span>
                </HintTooltip>
            ) : (
                chip
            )}
            <FieldErrorHint error={error} />
        </div>
    );
};
