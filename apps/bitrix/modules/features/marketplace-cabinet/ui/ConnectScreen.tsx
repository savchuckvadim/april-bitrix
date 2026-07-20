'use client';

import { useState } from 'react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Clock } from 'lucide-react';
import type { PortalSessionUser } from '@workspace/bitrix';
import { InviteCodeForm } from './InviteCodeForm';
import { OnboardingForm } from './OnboardingForm';
import { ResendCodeBlock } from './ResendCodeBlock';

/** Единая почта поддержки (совпадает с карточкой Маркета и юр-страницами) */
const SUPPORT_EMAIL = 'april-app@mail.ru';

/**
 * Экран подключения портала к внешнему сервису April — состояния
 * onboarding (кода ещё не просили) и pending (заявка подана, ждём код).
 *
 * Основной путь — ввод кода подключения; заявка это лишь способ код
 * запросить. Поэтому InviteCodeForm сверху и всегда доступна: код может
 * прийти клиенту и в обход заявки (выпустил вендор напрямую).
 *
 * ФОРМУЛИРОВКИ: приложение подаётся в Маркет как клиентский интерфейс
 * внешнего сервиса. Тексты описывают ОТСУТСТВИЕ подключения к внешней
 * инфраструктуре, а не «выключенный функционал» — правило Маркета
 * «функционал не должен включаться/выключаться по условиям» (docs:
 * ai/marketplace/publication/00-README.md, раздел «Позиционирование»).
 */
export const ConnectScreen = ({
    domain,
    user,
    state,
    organizationName,
    contactEmailMasked,
}: {
    domain?: string;
    user?: PortalSessionUser;
    state: 'onboarding' | 'pending';
    organizationName?: string;
    /** Маскированный контактный email организации — на него уходит код */
    contactEmailMasked?: string;
}) => {
    // На pending форму данных прячем: заявка уже подана. Раскрывается, если
    // клиент хочет поправить организацию или контактное лицо.
    const [editOpen, setEditOpen] = useState(false);

    return (
        <div className="flex min-h-screen justify-center bg-gray-50 p-6">
            <div className="w-full max-w-lg space-y-4">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">
                        Подключение портала к сервису April
                    </h1>
                    {domain && (
                        <Badge variant="outline" className="mt-2">
                            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                            {domain}
                        </Badge>
                    )}
                    <p className="mt-3 text-sm text-gray-600">
                        «Менеджер Гарант» — клиентский интерфейс внешнего
                        сервиса April. Обмен данными между вашим порталом и
                        сервисом начинается после подключения портала к
                        серверной инфраструктуре April в рамках договора на
                        настройку и сопровождение.
                    </p>
                </div>

                <InviteCodeForm />

                {state === 'onboarding' ? (
                    <OnboardingForm user={user} />
                ) : (
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-medium text-gray-900">
                            <Clock className="h-4 w-4 text-amber-500" />
                            Код запрошен
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            {organizationName
                                ? `Организация «${organizationName}»: заявка принята. `
                                : 'Заявка принята. '}
                            Код подключения придёт на{' '}
                            {contactEmailMasked ? (
                                <span className="font-medium text-gray-900">
                                    {contactEmailMasked}
                                </span>
                            ) : (
                                'указанный вами email'
                            )}{' '}
                            — обычно в течение одного рабочего дня. Вопросы:{' '}
                            {SUPPORT_EMAIL}.
                        </p>
                        <ResendCodeBlock
                            emailMasked={contactEmailMasked}
                            canUseAnotherAddress={user?.isAdmin === true}
                        />
                        {editOpen ? (
                            <div className="mt-4">
                                <OnboardingForm
                                    user={user}
                                    title="Изменить данные организации"
                                    description="Название, контактное лицо и контактный email организации."
                                />
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2"
                                onClick={() => setEditOpen(true)}
                            >
                                Изменить данные организации
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
