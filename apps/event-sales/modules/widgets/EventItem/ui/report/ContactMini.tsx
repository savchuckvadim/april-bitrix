'use client';

import { FC } from 'react';
import { UserRound } from 'lucide-react';
import { ContactTraitsStrip } from '@/modules/features/PbxContact';
import { keyTraits } from '@/modules/features/PbxContact/lib/contact-field-view';
import { useAppDispatch } from '@/modules/app/lib/hooks/redux';
import {
    EV_CONTACT_TYPE,
    eventContactActions,
} from '@/modules/entities/EventContact';
import { useContactCard } from '../../lib/hooks/use-contact-card';
import { ContactActions } from './contact/ContactActions';
import { ContactRemoveAction } from './contact/ContactRemoveAction';

/**
 * Контакт разговора миниатюрой — рядом с пультом, а не отдельной карточкой
 * ниже комментария.
 *
 * Показываем то, чем пользуются В РАЗГОВОРЕ: имя, должность и связь (телефон,
 * почта). Характеристик у контакта девять, и все девять здесь превращались в
 * частокол одинаковых полосок — оставлены три ключевые (ЛПР, отношение к
 * Гаранту и к конкуренту, см. keyTraits) и убраны в правый край: мельком
 * видно, с кем имеем дело и на чьей он стороне.
 *
 * Клик по имени и по полоскам открывает карточку — смотрят её чаще, чем
 * правят; действия (выбрать другого, править, снять) остаются иконками справа.
 */
export const ContactMini: FC = () => {
    const dispatch = useAppDispatch();
    const card = useContactCard();

    if (!card.report) return null;

    const open = (mode: 'view' | 'edit') =>
        dispatch(
            eventContactActions.openContactDialog({
                mode,
                side: EV_CONTACT_TYPE.REPORT,
            }),
        );

    const traits = keyTraits(card.traits);
    const contacts = [card.phone, card.email].filter(Boolean).join(' · ');

    return (
        <div className="flex h-full min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-2">
            <div className="flex min-w-0 items-center gap-1">
                <button
                    type="button"
                    onClick={() => open('view')}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left"
                    title="Открыть карточку контакта"
                >
                    <UserRound
                        aria-hidden
                        className="size-3.5 shrink-0 text-muted-foreground"
                    />
                    <span className="min-w-0 truncate text-xs font-semibold">
                        {card.name}
                    </span>
                    {card.post && (
                        <span className="min-w-0 shrink truncate text-[0.625rem] text-muted-foreground">
                            {card.post}
                        </span>
                    )}
                </button>

                <span className="inline-flex shrink-0 items-center">
                    <ContactActions
                        hasContact
                        onView={() => open('view')}
                        onEdit={() => open('edit')}
                        onPick={() =>
                            dispatch(
                                eventContactActions.openQuickPick({
                                    side: EV_CONTACT_TYPE.REPORT,
                                }),
                            )
                        }
                    />
                    <ContactRemoveAction />
                </span>
            </div>

            {/* Слева то, чем звонят, справа — что о человеке известно.
                Признаки идут ЭТАЖАМИ: втроём в ряд они ужимались до чёрточек
                по 25px, по которым ничего не прочесть. */}
            <div className="flex min-w-0 flex-1 items-start gap-2">
                <span className="min-w-0 flex-1 text-[0.625rem] leading-tight text-muted-foreground">
                    {contacts || 'телефон и почта не заполнены'}
                </span>

                {traits.length > 0 && (
                    <ContactTraitsStrip
                        fields={traits}
                        direction="column"
                        onOpen={() => open('view')}
                        className="w-24 shrink-0"
                    />
                )}
            </div>

            {card.planName && (
                <p
                    title={card.planName}
                    className="truncate text-[0.625rem] text-muted-foreground"
                >
                    план: {card.planName}
                </p>
            )}
        </div>
    );
};
