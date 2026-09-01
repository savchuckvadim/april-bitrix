/**
 * ConsoleFlowLogger: console с префиксом контекста — формат AppLogger
 * пакета (`«Context: » message`), уровни log/warn/error порта FlowLogger.
 */
import {
    ConsoleFlowLogger,
    createConsoleFlowLogger,
} from '../console-flow-logger';

describe('ConsoleFlowLogger', () => {
    it('пишет в console.log/warn/error с префиксом контекста', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const error = vi.spyOn(console, 'error').mockImplementation(() => {});
        try {
            const logger = new ConsoleFlowLogger('EventReportInitService');
            logger.log('строка', { extra: 1 });
            logger.warn('предупреждение');
            logger.error('ошибка');

            expect(log).toHaveBeenCalledWith(
                'EventReportInitService: ',
                'строка',
                { extra: 1 },
            );
            expect(warn).toHaveBeenCalledWith(
                'EventReportInitService: ',
                'предупреждение',
            );
            expect(error).toHaveBeenCalledWith(
                'EventReportInitService: ',
                'ошибка',
            );
        } finally {
            log.mockRestore();
            warn.mockRestore();
            error.mockRestore();
        }
    });

    it('фабрика отдаёт логгер с контекстом (как new Logger(Ctx.name) на бэке)', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        try {
            createConsoleFlowLogger('TaskFlow').log('ok');
            expect(log).toHaveBeenCalledWith('TaskFlow: ', 'ok');
        } finally {
            log.mockRestore();
        }
    });
});
