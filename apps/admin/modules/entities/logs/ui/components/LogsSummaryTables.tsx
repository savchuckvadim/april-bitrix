import { SectionCard } from '@workspace/april-ui/surfaces';
import { ToneBadge } from '@workspace/april-ui/badges';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table';
import { formatDelta, formatLogTime } from '../../lib/logs-view';
import type { LogsSummary } from '../../model';

interface LogsSummaryTablesProps {
    summary: LogsSummary;
    onPickApp: (app: string) => void;
    onPickDomain: (domain: string) => void;
}

const pickClass = 'text-left text-primary underline-offset-2 hover:underline';

/** Приложения, повторяющиеся ошибки и порталы за окно. */
export const LogsSummaryTables = ({
    summary,
    onPickApp,
    onPickDomain,
}: LogsSummaryTablesProps) => (
    <div className="space-y-4">
        <SectionCard
            title="Приложения"
            description="Ошибки и предупреждения за окно; в скобках — разница с прошлым таким же окном."
        >
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Приложение</TableHead>
                        <TableHead>Ошибки</TableHead>
                        <TableHead>Предупреждения</TableHead>
                        <TableHead>Записей</TableHead>
                        <TableHead>Последняя запись</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {summary.apps.map(app => (
                        <TableRow key={app.app}>
                            <TableCell>
                                <button type="button" className={pickClass} onClick={() => onPickApp(app.app)}>
                                    {app.app}
                                </button>
                            </TableCell>
                            <TableCell>
                                <ToneBadge tone={app.errors ? 'destructive' : 'muted'} size="sm">
                                    {app.errors} ({formatDelta(app.errors, app.prevErrors)})
                                </ToneBadge>
                            </TableCell>
                            <TableCell>{app.warnings}</TableCell>
                            <TableCell>{app.total}</TableCell>
                            <TableCell>{formatLogTime(app.lastAt)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </SectionCard>

        <SectionCard
            title="Повторяющиеся ошибки"
            description="Один шаблон — текст без чисел. Порталы — где встречалась."
        >
            {summary.topErrors.length === 0 ? (
                <p className="text-sm text-muted-foreground">Ошибок за окно нет.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Раз</TableHead>
                            <TableHead>Приложение</TableHead>
                            <TableHead>Ошибка</TableHead>
                            <TableHead>Порталы</TableHead>
                            <TableHead>Последняя</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary.topErrors.map(pattern => (
                            <TableRow key={`${pattern.app}-${pattern.sample}`}>
                                <TableCell>{pattern.count}</TableCell>
                                <TableCell>{pattern.app}</TableCell>
                                <TableCell className="max-w-xl whitespace-pre-wrap break-words text-xs">
                                    {pattern.sample}
                                </TableCell>
                                <TableCell className="text-xs">
                                    {pattern.domains.map(domain => (
                                        <button
                                            key={domain}
                                            type="button"
                                            className={`${pickClass} mr-2`}
                                            onClick={() => onPickDomain(domain)}
                                        >
                                            {domain}
                                        </button>
                                    ))}
                                </TableCell>
                                <TableCell>{formatLogTime(pattern.lastAt)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </SectionCard>

        <SectionCard title="Порталы" description="Где больше ошибок. Нажмите на портал — журналы только по нему.">
            {summary.domains.length === 0 ? (
                <p className="text-sm text-muted-foreground">Записей с порталом за окно нет.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Портал</TableHead>
                            <TableHead>Ошибки</TableHead>
                            <TableHead>Предупреждения</TableHead>
                            <TableHead>Записей</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {summary.domains.map(domain => (
                            <TableRow key={domain.domain}>
                                <TableCell>
                                    <button type="button" className={pickClass} onClick={() => onPickDomain(domain.domain)}>
                                        {domain.domain}
                                    </button>
                                </TableCell>
                                <TableCell>{domain.errors}</TableCell>
                                <TableCell>{domain.warnings}</TableCell>
                                <TableCell>{domain.total}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </SectionCard>
    </div>
);
