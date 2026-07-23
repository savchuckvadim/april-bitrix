import React from 'react';
import dynamic from 'next/dynamic';
import DatesFilter from './DatesFilter';
import ActionsFilter from './ActionsFilter';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@workspace/ui/components/card';
import { usePathname } from 'next/navigation';

const CompactDepartmentFilter = dynamic(
    () =>
        import('@/modules/feature/report-filter').then(
            m => m.CompactDepartmentFilter,
        ),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 animate-pulse rounded-md bg-muted" />
        ),
    },
);

interface FilterProps {
    isOpen: boolean;
}

export const Filter: React.FC<FilterProps> = ({ isOpen }) => {
    const pathname = usePathname();
    const isUserReport = pathname === '/report/user';

    if (!isOpen) return null;

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>Фильтры</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <DatesFilter />
                    </div>

                    <div className="space-y-4">
                        {!isUserReport && <CompactDepartmentFilter />}
                    </div>
                </div>
            </CardContent>

            {!isUserReport && (
                <CardContent>
                    <ActionsFilter />
                </CardContent>
            )}
        </Card>
    );
};

export default Filter;
