import React from 'react';
import { SectionCard } from '@workspace/april-ui/surfaces';

/**
 * Предложение не загрузилось из-за сбоя на нашей стороне.
 *
 * Недействующую ссылку (отозвана, истекла, не существует) сюда не приводят —
 * её уводят на главную. Здесь остаётся только случай, когда ссылка, скорее
 * всего, живая: клиенту надо понять, что стоит зайти позже, а не решить,
 * что предложение отменили.
 */
export const RenewalLinkGone: React.FC = () => {
    return (
        <div className="mx-auto w-full max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
            <SectionCard
                title="Не удалось открыть предложение"
                tone="neutral"
                surface="solid"
            >
                <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                    <p>
                        Похоже, это временная неполадка на нашей стороне, а не
                        с вашей ссылкой.
                    </p>
                    <p>
                        Попробуйте обновить страницу через несколько минут.
                        Если не откроется — напишите вашему менеджеру.
                    </p>
                </div>
            </SectionCard>
        </div>
    );
};
