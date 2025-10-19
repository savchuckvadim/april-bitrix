import { IBXUser } from '../../domain/interfaces/bitrix.interface';
import { IBitrixBatchResponseResult } from '../interface/bitrix-api.intterface';
import { AxiosError } from 'axios';
import { API_METHOD, backAPI, EBACK_ENDPOINT } from '@workspace/api';

export class BitrixBatchBackApiHelper {
    private readonly logger = {
        log: (message: string) => console.log(message),
        error: (message: string) => console.error(message),
        warn: (message: string) => console.warn(message),
    };
    constructor(
        private readonly telegramBot: {
            sendMessageAdminError: (message: string) => Promise<void>;
        },
        private readonly domain: string,
        private readonly user: IBXUser,
        private cmdBatch: Record<string, any> = {},
    ) {}
    public async callBatchWithConcurrency(limit = 3): Promise<any> {
        this.logger.log(`Calling batch async with concurrency limit: ${limit}`);
        const results: any = {};

        // Запускаем до `limit` параллельных воркеров
        await Promise.all(
            Array(limit)
                .fill(0)
                .map(() => this.runBatch(results)),
        );

        this.cmdBatch = {};
        return results;
    }

    private dictToQueryString(
        method: string,
        data: Record<string, any>,
    ): string {
        // this.logger.log(`Converting data to query string for method: ${method}`);
        const queryParts: string[] = [];

        const processItem = (key: string, value: any) => {
            key = key.trim();
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                for (const [subKey, subValue] of Object.entries(value)) {
                    processItem(`${key}[${subKey.trim()}]`, subValue);
                }
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        for (const [subKey, subValue] of Object.entries(item)) {
                            processItem(
                                `${key}[${index}][${subKey.trim()}]`,
                                subValue,
                            );
                        }
                    } else {
                        queryParts.push(`${key}[]=${item}`);
                    }
                });
            } else {
                queryParts.push(`${key}=${value}`);
            }
        };

        for (const [key, value] of Object.entries(data)) {
            processItem(key, value);
        }

        const queryString = `${method}?${queryParts.join('&')}`;
        // this.logger.log(`Generated query string: ${queryString}`);
        return queryString;
    }

    private async runBatch(results: any) {
        const commands = Object.entries(this.cmdBatch);

        let index = 0;
        while (index < commands.length) {
            const start = index;
            index += 50;
            const batch = commands.slice(start, index);

            const result = await this.executeBatch(batch);

            if (result && typeof result === 'object' && 'result' in result) {
                for (const key in result.result) {
                    results[key] = result.result[key];
                }
            } else {
                this.logger.warn(`Skipping failed batch at index ${start}`);
            }
            // 💤 Задержка между вызовами
            await this.sleep(100);
        }
    }

    private async executeBatch(
        batch: [string, { method: string; params: any }][],
    ) {
        // this.logger.log(`Executing batch of ${batch.length} commands`);
        const cmd: Record<string, string> = {};
        for (const [key, val] of batch) {
            const url = this.dictToQueryString(val.method, val.params);
            cmd[key] = url;
        }

        const payload = { halt: 0, cmd };

        try {
            this.logger.log(`Making batch request to: ${this.domain}`);

            const bxReqHookData = {
                domain: this.domain,
                method: 'batch',
                bxData: payload,
            };
            const response = await backAPI.service<{
                result: IBitrixBatchResponseResult;
            }>(EBACK_ENDPOINT.BITRIX_METHOD, API_METHOD.POST, bxReqHookData);
            const result = response.data?.result as IBitrixBatchResponseResult;

            const batchResultsCount = Object.keys(result?.result).length;
            this.logger.log(`Batch results count: ${batchResultsCount}`);
            await this.handleBatchErrors(result, 'executeBatch');
            return result;
        } catch (err) {
            const error = err as AxiosError;
            const msg = error?.response?.data || error;
            this.logger.error(`Execute batch failed: ${JSON.stringify(msg)}`);
            await this.telegramBot.sendMessageAdminError(
                `Execute batch failed: ${JSON.stringify(error)}`,
            );
            return error;
        }
    }
    clearResult(result: IBitrixBatchResponseResult[]) {
        const results = [] as any[];
        result.map(res => {
            if (Object.keys(res.result).length > 0) {
                for (const key in res.result) {
                    results.push(res.result[key]);
                }
            }
        });
        return results;
    }
    private async handleBatchErrors(
        result: IBitrixBatchResponseResult,
        context = 'Batch error',
    ): Promise<void> {
        if (!result?.result_error) return;
        this.logger.log(`
      success
      Domain:
      ${this.domain}
      `);

        const errorEntries = Object.entries(result.result_error);
        for (const [key, error] of errorEntries) {
            const message = `[${context}] Ошибка в ${key}: ${JSON.stringify(error)}

      Domain: ${this.domain}
      `;
            this.logger.log(`result_error: ${message}`);
            await this.telegramBot.sendMessageAdminError(message);
        }
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
