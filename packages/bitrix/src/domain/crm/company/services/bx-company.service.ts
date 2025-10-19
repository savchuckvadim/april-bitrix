import { BxCompanyRepository } from '../repository/bx-company.repository';
import { BitrixBaseApi } from '../../../../core';
import { IBXCompany } from '../interface/bx-company.interface';
import { IBXField } from '../../fields/bx-field.interface';

export class BxCompanyService {
    private repo!: BxCompanyRepository;

    clone(api: BitrixBaseApi): BxCompanyService {
        const instance = new BxCompanyService();
        instance.init(api);
        return instance;
    }

    init(api: BitrixBaseApi) {
        this.repo = new BxCompanyRepository(api);
    }

    async get(companyId: number): Promise<IBXCompany | null> {
        return (await this.repo.get(companyId)).result;
    }

    async getList(
        filter: Partial<IBXCompany>,
        select?: string[],
    ): Promise<IBXCompany[] | null> {
        return (await this.repo.getList(filter, select)).result;
    }

    async set(data: Partial<IBXCompany>): Promise<number | null> {
        return (await this.repo.set(data)).result;
    }

    async update(
        companyId: number | string,
        data: Partial<IBXCompany>,
    ): Promise<number | null> {
        return (await this.repo.update(companyId, data)).result;
    }

    async getFieldsList(
        filter: { [key: string]: any },
        select?: string[],
    ): Promise<IBXField[] | null> {
        return (await this.repo.getFieldList(filter, select)).result;
    }

    async getField(id: number | string): Promise<IBXField | null> {
        return (await this.repo.getField(id)).result;
    }
    async addField(fields: Partial<IBXField>): Promise<IBXField | null> {
        return (await this.repo.setField(fields)).result;
    }
}
