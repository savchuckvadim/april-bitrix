import React from 'react';
import { UserAwardBadges } from '@/modules/feature/report-awards';

interface UserReportHeaderProps {
    userName: string;
    userId: number;
    /** Домен портала для ссылки на профиль Bitrix; пусто — без ссылки. */
    domain?: string;
}

/**
 * Тонкая шапка user-report: только имя (ссылка на профиль Bitrix в новой
 * вкладке) и награды рядом. Без аватара, карточки и крупных чисел —
 * статистика вынесена в компактную сетку ниже.
 */
export const UserReportHeader: React.FC<UserReportHeaderProps> = ({
    userName,
    userId,
    domain,
}) => {
    const profileUrl = domain
        ? `https://${domain}/company/personal/user/${userId}/`
        : undefined;

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {profileUrl ? (
                <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-2xl font-semibold text-primary hover:underline"
                >
                    {userName}
                </a>
            ) : (
                <span className="text-2xl font-semibold text-primary">
                    {userName}
                </span>
            )}
            <UserAwardBadges userId={userId} />
        </div>
    );
};
