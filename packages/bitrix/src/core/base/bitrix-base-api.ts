// import * as https from 'https';
// import * as http from 'http';
// import { TelegramService } from '../../../telegram/telegram.service';
// import { AxiosResponse } from 'axios';
import {
    IBitrixBatchResponseResult,
    IBitrixResponse,
} from '../interface/bitrix-api.intterface';
// IBitrixBatchResponse,
import { BXApiSchema, EBxNamespace, TBXRequest, TBXResponse } from '../domain';
import {
    API_METHOD,
    backAPI,
    bxAPI,
    EBACK_ENDPOINT,
    getBxService,
} from '@workspace/api';
import {
    AuthData,
    B24Frame,
    initializeB24Frame,
    Result,
} from '@bitrix24/b24jssdk';
import { AxiosError } from 'axios';
import { IBXUser } from '../../domain/interfaces/bitrix.interface';
import {
    Placement,
    PlacementPlace,
} from '../../../../bx/src/type/placement-type';
import { CustomPlacement } from '../../domain/interfaces/bitrix-placement.intreface';
import { BitrixBatchBackApiHelper } from '../inner-api-helper/bitrix-batch-back-api-helper';
import { BXInitializedDto } from '../dto/bx-initialized.dto';
export enum BxAuthType {
    TOKEN = 'token',
    HOOK = 'hook',
}

export class BitrixBaseApi {
    private bx!: B24Frame;
    private inFrame: boolean = false;
    private initialized: boolean = false;
    public domain!: string;
    public user!: IBXUser;
    public authType: BxAuthType = BxAuthType.HOOK;

    private cmdBatch: Record<string, any> = {};

    private readonly logger = {
        log: (message: string) => console.log(message),
        error: (message: string) => console.error(message),
        warn: (message: string) => console.warn(message),
    };
    constructor(
        private readonly telegramBot: {
            sendMessageAdminError: (message: string) => Promise<void>;
        },
    ) {}

    async init(domain: string, user: IBXUser) {
        try {
            this.bx = await initializeB24Frame();
            this.bx.getHttpClient().setRestrictionManagerParams({
                sleep: 600,
                speed: 0.01,
                amount: 30 * 5,
            });
            this.inFrame = true;

            await this.getInitialized();
        } catch (error) {
            this.inFrame = false;
            this.domain = domain;
            this.user = user;
            this.logger.error(`Error initializing B24 frame: ${error}`);
        }
    }

    public getDomain() {
        return this.domain;
    }
    public getUser() {
        return this.user as IBXUser;
    }
    public getInitializedData(): BXInitializedDto {
        return {
            inFrame: this.inFrame,
            initialized: this.initialized,
            domain: this.domain,
            user: this.user,
        };
    }
    public getPlacement(): Placement | CustomPlacement | null {
        if (this.inFrame) {
            return {
                options: this.bx.placement.options,
                placement: this.bx.placement.title as PlacementPlace,
            };
        }
        return null;
    }
    public getFit() {
        if (this.inFrame) {
            return this.bx.parent.fitWindow();
        }
        return null;
    }

    private async getInitialized() {
        if (this.inFrame) {
            const authData = this.bx.auth.getAuthData() as false | AuthData;
            if (!authData) return this.domain;
            const domain = authData.domain;
            const hostname = new URL(domain).hostname;
            this.domain = hostname;
            this.user = (await this.getCurrentUser()) as IBXUser;
            this.initialized = true;
        }
        return this.initialized;
    }
    private async getCurrentUser() {
        let currentUser = null as null | IBXUser;
        const currentUserData = (await this.bx.callMethod(
            'user.current',
        )) as Result;
        if (currentUserData) {
            if (currentUserData.isSuccess) {
                currentUser = currentUserData.getData()
                    .result as unknown as IBXUser;
            }
        }
        return currentUser;
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

    addCmdBatchType<
        NAMESPACE extends keyof BXApiSchema,
        ENTITY extends keyof BXApiSchema[NAMESPACE],
        METHOD extends keyof BXApiSchema[NAMESPACE][ENTITY],
    >(
        cmd: string,
        namespace: NAMESPACE,
        entity: ENTITY,
        method: METHOD,
        data: TBXRequest<NAMESPACE, ENTITY, METHOD>,
    ) {
        let resultMethod = `${String(namespace)}.${String(entity)}.${String(method)}`;
        if (namespace === EBxNamespace.WITHOUT_NAMESPACE) {
            resultMethod = `${String(entity)}.${String(method)}`;
        }

        if (!this.cmdBatch[cmd]) {
            this.cmdBatch[cmd] = {
                method: resultMethod,
                params: data,
            };
        }
    }

    getCmdBatch(): Record<string, string> {
        return this.cmdBatch;
    }

    async callType<
        NAMESPACE extends keyof BXApiSchema,
        ENTITY extends keyof BXApiSchema[NAMESPACE],
        METHOD extends keyof BXApiSchema[NAMESPACE][ENTITY],
    >(
        namespace: NAMESPACE,
        entity: ENTITY,
        method: METHOD,
        data: TBXRequest<NAMESPACE, ENTITY, METHOD>,
    ): Promise<IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>> {
        let resultMethod = `${String(namespace)}.${String(entity)}.${String(method)}`;
        if (namespace === EBxNamespace.WITHOUT_NAMESPACE) {
            resultMethod = `${String(entity)}.${String(method)}`;
        }

        try {
            // // const response = await firstValueFrom(
            // //     this.httpService.post(url, data, this.axiosOptions),
            // // ) as AxiosResponse<IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>>;
            // // this.logger.log(`API call successful: ${JSON.stringify(resultMethod)}`);
            // const response = await bxAPI.getProtectedMethod(resultMethod, data as object, this.domain)

            // return response.data as IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>;
            return (await this.callMethod(
                resultMethod,
                data,
            )) as IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>;
        } catch (err) {
            const error = err as AxiosError;
            await this.telegramBot.sendMessageAdminError(
                `Bitrix call error: ${JSON.stringify(error?.response?.data || error)}`,
            );
            throw error;
        }
    }

    private async callMethod<
        NAMESPACE extends keyof BXApiSchema,
        ENTITY extends keyof BXApiSchema[NAMESPACE],
        METHOD extends keyof BXApiSchema[NAMESPACE][ENTITY],
    >(
        method: string,
        data: TBXRequest<NAMESPACE, ENTITY, METHOD>,
    ): Promise<IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>> {
        let result = null as null | any;
        let response = null;

        if (this.inFrame) {
            const bxRresponse = (await this.bx.callMethod(
                method,
                data as object,
                -1,
            )) as Result;
            response = bxRresponse.getData() as IBitrixResponse<
                TBXResponse<NAMESPACE, ENTITY, METHOD>
            >;
            console.log('BITRIX RESPONSE CALL METHOD');
            console.log(response);
            return response;
        } else {
            const bxReqHookData = {
                domain: this.domain,
                method,
                bxData: data,
                authType: this.authType,
            };

            const backReponse = await backAPI.service<
                IBitrixResponse<TBXResponse<NAMESPACE, ENTITY, METHOD>>
            >(EBACK_ENDPOINT.BITRIX_METHOD, API_METHOD.POST, bxReqHookData);

            result = backReponse?.data || null;
            console.log('BACK RESPONSE CALL METHOD');
            console.log(result);
            return result;
        }
    }

    public async call<T>(method: string, data: any): Promise<any> {
        let result = null as null | any;
        let response = null;

        if (this.inFrame) {
            const bxRresponse = (await this.bx.callMethod(
                method,
                data as object,
                -1,
            )) as Result;
            response = bxRresponse.getData() as T;
            console.log('BITRIX RESPONSE CALL METHOD');
            console.log(response);
            return response;
        } else {
            const bxReqHookData = {
                domain: this.domain,
                method,
                bxData: data,
                authType: this.authType,
            };
            const backReponse = await backAPI.service<T>(
                EBACK_ENDPOINT.BITRIX_METHOD,
                API_METHOD.POST,
                bxReqHookData,
            );
            result = backReponse?.data || null;
            console.log('BACK RESPONSE CALL METHOD');
            console.log(result);
            return result as T;
        }
    }
    /**
     *
     * @returns
     * Возвращает массив ответов от битрикса без cmd key всех пачек > 50
     */
    public async callBatchByChunk(): Promise<IBitrixBatchResponseResult[]> {
        if (this.inFrame) {
            const commands = [];
            for (const key in this.cmdBatch) {
                commands.push(this.cmdBatch[key]);
            }
            const bxResponse = (await this.bx.callBatchByChunk(
                commands,
                false,
            )) as Result;
            const result = bxResponse.getData();
            console.log('BITRIX RESPONSE CALL BATCH');
            console.log(result);
            this.cmdBatch = {};
            return result;
        }
        const devBatchService = new BitrixBatchBackApiHelper(
            this.telegramBot,
            this.domain,
            this.user,
            this.cmdBatch,
        );
        const result = await devBatchService.callBatchWithConcurrency();
        console.log('RESULT BACK CALL BATCH');
        console.log(result);
        this.cmdBatch = {};
        return result;
    }

    /**
     *
     * @returns
     * Возвращает объект с ключами cmd и результатом в dev - всех пачек во фрейме не больше 50
     */
    public async callBatch(): Promise<any> {
        if (this.inFrame) {
            const bxResponse = (await this.bx.callBatch(
                this.cmdBatch,
                false,
            )) as Result;
            const result = bxResponse.getData();
            console.log('BITRIX RESPONSE CALL BATCH');
            console.log(result);

            this.cmdBatch = {};
            return result;
        }

        const devBatchService = new BitrixBatchBackApiHelper(
            this.telegramBot,
            this.domain,
            this.user,
            this.cmdBatch,
        );
        const result = await devBatchService.callBatchWithConcurrency();
        console.log('RESULT BACK CALL BATCH');
        console.log(result);
        this.cmdBatch = {};
        return result;
    }

    // private async callBatchWithConcurrency(limit = 3): Promise<any> {
    //     this.logger.log(`Calling batch async with concurrency limit: ${limit}`);

    //     const commands = Object.entries(this.cmdBatch);
    //     const results: any = {};

    //     let index = 0;

    //     const runBatch = async (): Promise<void> => {
    //         while (index < commands.length) {
    //             const start = index;
    //             index += 50;
    //             const batch = commands.slice(start, index);

    //             const result = await this.executeBatch(batch);

    //             if (result && typeof result === 'object' && 'result' in result) {
    //
    //                 for (const key in result.result) {
    //                     results[key] = result.result[key]
    //                 }
    //             } else {
    //                 this.logger.warn(`Skipping failed batch at index ${start}`);
    //             }
    //             // 💤 Задержка между вызовами

    //             await this.sleep(100);
    //         }
    //     };

    //     // Запускаем до `limit` параллельных воркеров
    //     await Promise.all(Array(limit).fill(0).map(() => runBatch()));

    //     this.cmdBatch = {};
    //     return results;
    // }

    // private async executeBatch(batch: [string, { method: string, params: any }][]) {
    //     // this.logger.log(`Executing batch of ${batch.length} commands`);
    //     const cmd: Record<string, string> = {};
    //     for (const [key, val] of batch) {

    //         const url = this.dictToQueryString(val.method, val.params);
    //         cmd[key] = url;
    //     }

    //     const payload = { halt: 0, cmd };

    //     try {
    //         this.logger.log(`Making batch request to: ${this.domain}`);
    //         // const response = await firstValueFrom(
    //         //     this.httpService.post(url, payload, this.axiosOptions),
    //         // ) as AxiosResponse<IBitrixBatchResponse>;
    //         // if (!this.inFrame) {
    //         const bxReqHookData = {
    //             domain: this.domain,
    //             method: 'batch',
    //             bxData: payload
    //         };
    //         const response = await backAPI.service<{ result: IBitrixBatchResponseResult }>(
    //             EBACK_ENDPOINT.BITRIX_METHOD,
    //             API_METHOD.POST,
    //             bxReqHookData
    //         )
    //         const result = response.data.result as IBitrixBatchResponseResult
    //
    //         // return result.data
    //         // }
    //         // const response = await this.bx.callBatch(payload) as Result;
    //         // const responseResult = response.getData();
    //         // const result = responseResult.data.result as IBitrixBatchResponseResult;
    //         // this.logger.log(`Batch request successful: ${JSON.stringify(result)}`);
    //         // this.logger.log(`Domain: ${this.domain}`);
    //         const batchResultsCount = Object.keys(result?.result).length;
    //         this.logger.log(`Batch results count: ${batchResultsCount}`);
    //         await this.handleBatchErrors(result, 'executeBatch');
    //         return result;
    //     } catch (err) {
    //         const error = err as AxiosError;
    //         const msg = error?.response?.data || error;
    //         this.logger.error(`Execute batch failed: ${JSON.stringify(msg)}`);
    //         await this.telegramBot.sendMessageAdminError(
    //             `Execute batch failed: ${JSON.stringify(error)}`
    //         );
    //         return error;
    //     }
    // }
    private clearResult(result: IBitrixBatchResponseResult[]) {
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
    // private async handleBatchErrors(result: IBitrixBatchResponseResult, context = 'Batch error'): Promise<void> {
    //     if (!result?.result_error) return;
    //     this.logger.log(`
    //   success
    //   Domain:
    //   ${this.domain}
    //   `);

    //     const errorEntries = Object.entries(result.result_error);
    //     for (const [key, error] of errorEntries) {
    //         const message = `[${context}] Ошибка в ${key}: ${JSON.stringify(error)}

    //   Domain: ${this.domain}
    //   `;
    //         this.logger.log(`result_error: ${message}`);
    //         await this.telegramBot.sendMessageAdminError(message);

    //     }
    // }

    // private async sleep(ms: number): Promise<void> {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // }
}
