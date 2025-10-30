import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { TimelineMode } from '../model/types';

interface TimelineModeSelectorProps {
    mode: TimelineMode;
    onModeChange: (mode: TimelineMode) => void;
}

export const TimelineModeSelector: React.FC<TimelineModeSelectorProps> = ({
    mode,
    onModeChange
}) => {
    const modeLabels = {
        detailed: 'Детализация',
        average: 'Средние показатели',
        total: 'Итоговые показатели'
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Режим:</label>
            <Select value={mode} onValueChange={onModeChange}>
                <SelectTrigger className="w-48">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="detailed">
                        {modeLabels.detailed}
                    </SelectItem>
                    <SelectItem value="average">
                        {modeLabels.average}
                    </SelectItem>
                    <SelectItem value="total">
                        {modeLabels.total}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
