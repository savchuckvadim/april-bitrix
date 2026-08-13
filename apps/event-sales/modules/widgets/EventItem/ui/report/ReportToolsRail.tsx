'use client';

import { FC } from 'react';
import { IconAction } from '@workspace/april-ui';
import { useReportTools } from '../../lib/hooks/use-report-tools';

/**
 * Панель недостающего в отчёте: по иконке на каждое, что можно добавить.
 *
 * Стоит в правом верхнем углу пульта абсолютно — и в свёрнутом виде, и в
 * развёрнутом место одно и то же, так что рука привыкает. Добавили — иконка
 * пропала, вместо неё появилась карточка с данными.
 */
export const ReportToolsRail: FC = () => {
    const tools = useReportTools();

    if (!tools.length) return null;

    return (
        <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5">
            {tools.map(tool => (
                <IconAction
                    key={tool.id}
                    icon={tool.icon}
                    label={tool.label}
                    hint={tool.hint}
                    onClick={tool.run}
                />
            ))}
        </span>
    );
};
