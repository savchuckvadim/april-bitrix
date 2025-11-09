'use client';

// import {useColorScheme} from "@workspace/theme"
// import { useTheme } from "next-themes"
export interface SimpleStatisticsProps {
    title: string;
    value: number;
    // icon: 'people' | 'check' | 'clock' | 'star'
    color:
        | 'green'
        | 'blue'
        | 'red'
        | 'yellow'
        | 'violet'
        | 'orange'
        | 'purple'
        | 'indigo'
        | 'red';
}

export const SimpleStatisticsCard = ({
    title,
    value,
    color,
}: SimpleStatisticsProps) => {
    //    const {
    //     scheme
    //    } = useColorScheme()
    //    console.log(scheme)

    return (
        <div className={`text-center p-3 bg-${color}-100 rounded-lg`}>
            <div className={`text-2xl font-bold text-${color}-600`}>
                {value || 0}
            </div>
            <div className={`text-sm text-${color}-600`}>{title}</div>
        </div>
    );
};
