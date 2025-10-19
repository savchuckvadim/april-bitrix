import { BitrixBaseApi } from './core/base/bitrix-base-api';
// import { BitrixApiFactoryService } from './core/queue/bitrix-api.factory.service';
import {
    BxCompanyService,
    BxContactBatchService,
    BxContactService,
    BxDealService,
    BxProductRowBatchService,
    BxProductRowService,
    BxCategoryService,
    BxStatusService,
    BxItemService,
    BxItemBatchService,
    BxTimelineService,
    BxTimelineBatchService,

} from './domain/crm/';

import { BxDealBatchService, BxCompanyBatchService } from './domain/crm/';
import { ServiceClonerFactory } from './domain/service-clone.factory';
import { BxProductBatchService, BxProductService } from './domain/catalog';
import { BxListBatchService, BxListService } from './domain/list';
import {
    BxUserFieldConfigBatchService,
    BxUserFieldConfigService,
} from './domain/userfieldconfig';
import { BxSmartTypeService } from './domain/crm/smart-type/services/bx-smart-type.service';
import { BxRpaItemService } from './domain/rpa/item/services/bx-rpa-item.service';
import { BxRpaItemBatchService } from './domain/rpa/item/services/bx-rpa-item.batch.service';
import { BxFileService } from './domain/file/bx-file.service';
import { IBXUser } from './domain/interfaces/bitrix.interface';
import { ActivityService } from './domain/activity/services/bx-activity.service';
import { BxActivityBatchService } from './domain/activity/services/bx-activity.batch.service';
import { BxActivityConfigurableService } from './domain/activity-configurable/services/bx-activity-configurable.service';
import { BxActivityConfigurableBatchService } from './domain/activity-configurable/services/bx-activity-configurable.batch.service';

// @Injectable()
export class BitrixService {
    constructor() { }

    private cloner: ServiceClonerFactory = new ServiceClonerFactory();
    public api!: BitrixBaseApi;
    public activity!: ActivityService;
    public activityConfigurable!: BxActivityConfigurableService;
    public deal!: BxDealService;
    public company!: BxCompanyService;
    public productRow!: BxProductRowService;
    public contact!: BxContactService;
    public category!: BxCategoryService;
    public status!: BxStatusService;
    public item!: BxItemService;
    public timeline!: BxTimelineService;
    public list!: BxListService;
    public product!: BxProductService;
    public userFieldConfig!: BxUserFieldConfigService;
    public smartType!: BxSmartTypeService;
    public rpaItem!: BxRpaItemService;
    public file!: BxFileService;

    public batch = {
        activity: null as unknown as BxActivityBatchService,
        activityConfigurable: null as unknown as BxActivityConfigurableBatchService,
        deal: null as unknown as BxDealBatchService,
        company: null as unknown as BxCompanyBatchService,
        productRow: null as unknown as BxProductRowBatchService,
        contact: null as unknown as BxContactBatchService,
        item: null as unknown as BxItemBatchService,
        timeline: null as unknown as BxTimelineBatchService,
        list: null as unknown as BxListBatchService,
        product: null as unknown as BxProductBatchService,
        userFieldConfig: null as unknown as BxUserFieldConfigBatchService,
        rpaItem: null as unknown as BxRpaItemBatchService,
    };

    public async init(domain: string, user: IBXUser) {
        // this.cloner = new ServiceClonerFactory();
        this.api = new BitrixBaseApi({
            sendMessageAdminError: (message: string) => Promise.resolve(),
        });

        await this.api.init(domain, user);
        this.initActivity();
        this.initActivityConfigurable();
        this.initDeal();
        this.initCompany();
        this.initProductRow();
        this.initContact();
        this.initCategory();
        this.initStatus();
        this.initItem();
        this.initTimeline();
        this.initList();
        this.initProduct();
        this.initUserFieldConfig();
        this.initSmartType();
        this.initRpaItem();
        this.initFile();
    }

    private initActivity() {
        this.activity = this.cloner.clone(ActivityService, this.api);
        this.batch.activity = this.cloner.clone(BxActivityBatchService, this.api);
    }
    private initActivityConfigurable() {
        this.activityConfigurable = this.cloner.clone(BxActivityConfigurableService, this.api);
        this.batch.activityConfigurable = this.cloner.clone(BxActivityConfigurableBatchService, this.api);
    }

    private initDeal() {
        this.deal = this.cloner.clone(BxDealService, this.api);
        this.batch.deal = this.cloner.clone(BxDealBatchService, this.api);
    }

    private initCompany() {
        this.company = this.cloner.clone(BxCompanyService, this.api);
        this.batch.company = this.cloner.clone(BxCompanyBatchService, this.api);
    }
    private initProductRow() {
        this.productRow = this.cloner.clone(BxProductRowService, this.api);
        this.batch.productRow = this.cloner.clone(
            BxProductRowBatchService,
            this.api,
        );
    }
    private initContact() {
        this.contact = this.cloner.clone(BxContactService, this.api);
        this.batch.contact = this.cloner.clone(BxContactBatchService, this.api);
    }
    private initCategory() {
        this.category = this.cloner.clone(BxCategoryService, this.api);
    }
    private initStatus() {
        this.status = this.cloner.clone(BxStatusService, this.api);
    }
    private initItem() {
        this.item = this.cloner.clone(BxItemService, this.api);
        this.batch.item = this.cloner.clone(BxItemBatchService, this.api);
    }
    private initTimeline() {
        this.timeline = this.cloner.clone(BxTimelineService, this.api);
        this.batch.timeline = this.cloner.clone(
            BxTimelineBatchService,
            this.api,
        );
    }
    private initList() {
        this.list = this.cloner.clone(BxListService, this.api);
        this.batch.list = this.cloner.clone(BxListBatchService, this.api);
    }
    private initProduct() {
        this.product = this.cloner.clone(BxProductService, this.api);
        this.batch.product = this.cloner.clone(BxProductBatchService, this.api);
    }
    private initUserFieldConfig() {
        this.userFieldConfig = this.cloner.clone(
            BxUserFieldConfigService,
            this.api,
        );
        this.batch.userFieldConfig = this.cloner.clone(
            BxUserFieldConfigBatchService,
            this.api,
        );
    }
    private initSmartType() {
        this.smartType = this.cloner.clone(BxSmartTypeService, this.api);
    }
    private initRpaItem() {
        this.rpaItem = this.cloner.clone(BxRpaItemService, this.api);
        this.batch.rpaItem = this.cloner.clone(BxRpaItemBatchService, this.api);
    }
    private initFile() {
        this.file = this.cloner.clone(BxFileService, this.api);
    }
}
