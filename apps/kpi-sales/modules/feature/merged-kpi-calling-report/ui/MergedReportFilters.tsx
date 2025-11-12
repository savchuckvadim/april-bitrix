'use client'
import React from 'react';
import { RTableProps } from '@/modules/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Badge } from '@workspace/ui/components/badge';
import { Label } from '@workspace/ui/components/label';
import { Button } from '@workspace/ui/components/button';
import { X } from 'lucide-react';

interface MergedReportFiltersProps {
    data: RTableProps['data'];
    selectedUsers: number[];
    selectedActions: string[];
    onUserChange: (userId: number, checked: boolean) => void;
    onActionChange: (actionName: string, checked: boolean) => void;
    onSelectAllUsers: (checked: boolean) => void;
    onSelectAllActions: (checked: boolean) => void;
}

export const MergedReportFilters: React.FC<MergedReportFiltersProps> = ({
    data,
    selectedUsers,
    selectedActions,
    onUserChange,
    onActionChange,
    onSelectAllUsers,
    onSelectAllActions,
}) => {
    const longest = data.reduce((prev, curr) => {
        return (curr.actions?.length || 0) > (prev?.actions?.length || 0) ? curr : prev;
    }, data[0]);
    const allUsers = data.map(item => item.id).filter((id): id is number => id !== undefined);
    const allActions = longest?.actions.map(action => action.name) || [];

    const allUsersSelected = allUsers.length > 0 && allUsers.every(id => selectedUsers.includes(id));
    const allActionsSelected = allActions.length > 0 && allActions.every(action => selectedActions.includes(action));

    const hasActiveFilters = selectedUsers.length < allUsers.length || selectedActions.length < allActions.length;

    const clearAllFilters = () => {
        onSelectAllUsers(true);
        onSelectAllActions(true);
    };

    return (
        <Card className="mb-4">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Фильтры</CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="flex items-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Очистить все
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Фильтр по пользователям */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Менеджеры</Label>
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectAllUsers(!allUsersSelected)}
                            className="h-auto py-1 px-2 text-xs"
                        >
                            {allUsersSelected ? 'Снять все' : 'Выбрать все'}
                        </Button> */}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {data.map((item) => {
                            const isSelected = item.id !== undefined && selectedUsers.includes(item.id);
                            return (
                                <Badge
                                    key={item.id || item.name}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() =>
                                        item.id !== undefined && onUserChange(item.id, !isSelected)
                                    }
                                >
                                    {item.name}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                {/* Фильтр по действиям */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Показатели</Label>
                        {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSelectAllActions(!allActionsSelected)}
                            className="h-auto py-1 px-2 text-xs"
                        >
                            {allActionsSelected ? 'Снять все' : 'Выбрать все'}
                        </Button> */}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {allActions.map((actionName) => {
                            const isSelected = selectedActions.includes(actionName);
                            return (
                                <Badge
                                    key={actionName}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => onActionChange(actionName, !isSelected)}
                                >
                                    {actionName}
                                </Badge>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

