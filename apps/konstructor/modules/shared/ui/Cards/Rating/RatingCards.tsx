import { IRaitingCardProps, RaitingCard } from './RaitingCard';

interface IRatingCardsProps {
    cards: IRaitingCardProps[];
}

export const RatingCards = ({ cards }: IRatingCardsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map(card => (
                <RaitingCard key={card.title} {...card} />
            ))}
        </div>
    );
};
