import { Check, CircleCheck, Clock, Star, Users } from 'lucide-react';

export interface IRaitingCardProps {
    title: string;
    value: number;
    icon: 'people' | 'check' | 'clock' | 'star';
    color: 'green' | 'blue' | 'red' | 'yellow' | 'violet' | 'orange' | 'purple';
}

export const RaitingCard = ({
    title,
    value,
    color,
    icon,
}: IRaitingCardProps) => {
    return (
        <div className="bg-card/10 rounded-lg border p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-foreground">
                        {title}
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                        {value}
                    </p>
                </div>
                <div
                    className={`w-10 h-10 bg-${color}-100/90 rounded-lg flex items-center justify-center`}
                >
                    {/* <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg> */}
                    {getIcon(icon, color)}
                </div>
            </div>
        </div>
    );
};

const getIcon = (
    icon: 'people' | 'check' | 'clock' | 'star',
    color: 'green' | 'blue' | 'red' | 'yellow' | 'violet' | 'orange' | 'purple',
) => {
    switch (icon) {
        case 'people':
            return <Users size={17} className={`text-${color}-600`} />;
        case 'check':
            return <CircleCheck size={17} className={` text-${color}-600`} />;
        case 'clock':
            return <Clock size={17} className={` text-${color}-600`} />;
        case 'star':
            return (
                <Star
                    size={17}
                    color={color}
                    className={` text-${color}-600`}
                />
            );
    }
};
