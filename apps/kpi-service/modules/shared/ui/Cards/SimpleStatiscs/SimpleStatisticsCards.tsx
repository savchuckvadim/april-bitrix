'use client';
import {
    SimpleStatisticsCard,
    SimpleStatisticsProps,
} from './SimpleStatisticsCard';

export interface SimpleStatisticsCardsProps {
    cards: SimpleStatisticsProps[];
}

export const SimpleStatisticsCards = ({
    cards,
}: SimpleStatisticsCardsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map(card => (
                <SimpleStatisticsCard key={card.title} {...card} />
            ))}
        </div>
    );
};
