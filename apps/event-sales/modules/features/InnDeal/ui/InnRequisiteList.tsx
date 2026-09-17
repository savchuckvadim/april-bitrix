'use client';

import { FC } from 'react';
import { ToneBadge } from '@workspace/april-ui';
import type { InnRequisiteCard } from '../model';
import { otherDealsLabel } from '../lib/inn-deal-view';

interface InnRequisiteListProps {
    requisites: InnRequisiteCard[];
    readable: boolean;
}

/**
 * Реквизиты клиента карточками.
 *
 * Реквизиты бывают ТОЛЬКО у компании и контакта — у сделки это привязка
 * (`crm.requisite.link`), и именно она ведущая: по привязанному реквизиту
 * уходят счёт и печатные формы. Поэтому привязанный помечен явно.
 */
export const InnRequisiteList: FC<InnRequisiteListProps> = ({
    requisites,
    readable,
}) => {
    if (!readable) {
        return (
            <p className="text-xs text-muted-foreground">
                Реквизиты недоступны: у интеграции нет прав на справочник
                реквизитов.
            </p>
        );
    }

    if (!requisites.length) {
        return (
            <p className="text-xs text-muted-foreground">
                Реквизитов у клиента нет. Печатная форма по такому договору
                будет неполной.
            </p>
        );
    }

    return (
        <ul className="space-y-1.5">
            {requisites.map(requisite => (
                <li
                    key={requisite.id}
                    className="rounded-md border border-border/60 px-2 py-1.5"
                >
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-sm">
                            {requisite.inn || '— без ИНН'}
                        </span>
                        {requisite.linked && (
                            <ToneBadge tone="success" variant="soft" size="sm">
                                привязан к сделке
                            </ToneBadge>
                        )}
                        <ToneBadge tone="muted" variant="soft" size="sm">
                            {requisite.ownerType === 'company'
                                ? 'компания'
                                : 'контакт'}
                        </ToneBadge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {[
                            requisite.companyName || requisite.ownerTitle,
                            requisite.kpp ? `КПП ${requisite.kpp}` : '',
                            requisite.presetName || requisite.name,
                        ]
                            .filter(Boolean)
                            .join(' · ')}
                    </p>
                    {requisite.otherDealIds.length > 0 && (
                        <p className="text-xs text-warning">
                            {otherDealsLabel(requisite.otherDealIds)}
                        </p>
                    )}
                </li>
            ))}
        </ul>
    );
};
