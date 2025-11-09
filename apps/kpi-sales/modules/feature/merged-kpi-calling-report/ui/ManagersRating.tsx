'use client'
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { RTableProps } from '@/modules/shared';
import { Trophy, Presentation, Phone, TrendingUp } from 'lucide-react';

interface ManagersRatingProps {
    data: RTableProps['data'];
    selectedActions: string[];
}

interface RatingItem {
    userId: number;
    userName: string;
    value: number;
}

export const ManagersRating: React.FC<ManagersRatingProps> = ({
    data,
    selectedActions
}) => {
    // Определяем категории для рейтинга
    const categories = useMemo(() => {
        const allActions = data[0]?.actions.map(action => action.name) || [];
        const actionsToShow = selectedActions.length > 0
            ? allActions.filter(action => selectedActions.includes(action))
            : allActions;

        // Ищем ключевые слова в названиях действий для категорий
        const presentationActions = actionsToShow.filter(action =>
            action.toLowerCase().includes('презентация') ||
            action.toLowerCase().includes('presentation')
        );

        const salesActions = actionsToShow.filter(action =>
            action.toLowerCase().includes('кп') ||
            action.toLowerCase().includes('счет') ||
            action.toLowerCase().includes('оплачен') ||
            action.toLowerCase().includes('сделка') ||
            action.toLowerCase().includes('продаж')
        );

        const callsOverMinuteActions = actionsToShow.filter(action =>
            action.toLowerCase().includes('звонк') &&
            (action.toLowerCase().includes('минут') || action.toLowerCase().includes('>'))
        );

        return {
            presentations: presentationActions,
            sales: salesActions,
            callsOverMinute: callsOverMinuteActions,
            all: actionsToShow,
        };
    }, [data, selectedActions]);

    // Вычисляем рейтинги
    const ratings = useMemo(() => {
        const calculateRating = (actionNames: string[]): RatingItem[] => {
            if (actionNames.length === 0) return [];

            return data
                .map(user => {
                    const total = actionNames.reduce((sum, actionName) => {
                        const action = user.actions.find(a => a.name === actionName);
                        return sum + (action?.value || 0);
                    }, 0);

                    return {
                        userId: user.id || 0,
                        userName: user.name,
                        value: total,
                    };
                })
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .slice(0, 10); // Топ 10
        };

        return {
            presentations: calculateRating(categories.presentations),
            sales: calculateRating(categories.sales),
            callsOverMinute: calculateRating(categories.callsOverMinute),
            total: calculateRating(categories.all),
        };
    }, [data, categories]);

    const renderRatingCard = (
        title: string,
        items: RatingItem[],
        icon: React.ReactNode,
        color: string
    ) => {
        if (items.length === 0) return null;

        return (
            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className={color}>{icon}</span>
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div
                                key={`${item.userId}-${title}`}
                                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-500 text-white' :
                                            index === 1 ? 'bg-gray-400 text-white' :
                                                index === 2 ? 'bg-orange-600 text-white' :
                                                    'bg-muted text-foreground'
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <span className="font-medium">{item.userName}</span>
                                </div>
                                <span className="font-semibold text-lg">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderRatingCard(
                'Рейтинг по презентациям',
                ratings.presentations,
                <Presentation className="w-5 h-5" />,
                'text-yellow-500'
            )}
            {renderRatingCard(
                'Рейтинг по продажам',
                ratings.sales,
                <TrendingUp className="w-5 h-5" />,
                'text-green-500'
            )}
            {renderRatingCard(
                'Рейтинг по звонкам > 1 минуты',
                ratings.callsOverMinute,
                <Phone className="w-5 h-5" />,
                'text-blue-500'
            )}
            {renderRatingCard(
                'Общий рейтинг',
                ratings.total,
                <Trophy className="w-5 h-5" />,
                'text-purple-500'
            )}
        </div>
    );
};

