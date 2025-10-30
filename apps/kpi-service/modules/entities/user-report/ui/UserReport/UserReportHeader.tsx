import React from 'react';
import { Card } from "@workspace/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Badge } from "@workspace/ui/components/badge";
import { User } from 'lucide-react';

interface UserReportHeaderProps {
    userName: string;
    userId: number;
    avatar?: string;
    totalEvents: number;
}

export const UserReportHeader: React.FC<UserReportHeaderProps> = ({ userName, userId, avatar, totalEvents }) => {
    const initials = userName
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

    return (
        <Card className="p-6 bg-background-card from-blue-50 to-indigo-50 border-primary/100">
            <div className="flex items-center gap-6">
                <Avatar className="w-20 h-20 bg-gradient-to-br from-card to-primary text-foreground">
                    {avatar
                        ? <AvatarImage src={avatar} alt={userName} />
                        : <AvatarFallback className="text-2xl font-semibold text-primary border border-primary border-2">
                            {initials}
                        </AvatarFallback>
                    }
                </Avatar>

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-primary">{userName}</h1>
                        <Badge variant="secondary" className="bg-card text-foreground">
                            ID: {userId}
                        </Badge>
                    </div>
                    <p className="text-foreground-muted flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Отчет о деятельности пользователя
                    </p>
                </div>

                <div className="text-right">
                    <div className="text-4xl font-bold text-blue-600">{totalEvents.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Событий</div>
                </div>
            </div>
        </Card>
    );
};
