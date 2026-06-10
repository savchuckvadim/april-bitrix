export interface Provider {
    id: number;
    name: string;
    title: string;
    withTax?: 0 | 1
    rq: {
        id?: number;
        [PROVIDER_KEY.NAME]: string;
        [PROVIDER_KEY.NUMBER]: string;
        [PROVIDER_KEY.TYPE]: string;
        [PROVIDER_KEY.FULLNAME]: string;
        [PROVIDER_KEY.SHORTNAME]: string;
        [PROVIDER_KEY.DIRECTOR]: string;
        [PROVIDER_KEY.POSITION]: string;
        [PROVIDER_KEY.ACCOUNTANT]: string;
        [PROVIDER_KEY.BASED]: string;
        [PROVIDER_KEY.INN]: string;
        [PROVIDER_KEY.KPP]: string;
        [PROVIDER_KEY.OGRN]: string;
        [PROVIDER_KEY.OGRNIP]: string;
        [PROVIDER_KEY.PERSON_NAME]: string;
        [PROVIDER_KEY.DOCUMENT]: string;
        [PROVIDER_KEY.DOC_SER]: string;
        [PROVIDER_KEY.DOC_NUM]: string;
        [PROVIDER_KEY.DOC_DATE]: string;
        [PROVIDER_KEY.DOC_ISSUED_BY]: string;
        [PROVIDER_KEY.DOC_DEP_CODE]: string;
        [PROVIDER_KEY.EMAIL]: string;
        [PROVIDER_KEY.GARANT_EMAIL]: string;
        [PROVIDER_KEY.PHONE]: string;
        [PROVIDER_KEY.ASSIGNED]: string;
        [PROVIDER_KEY.ASSIGNED_PHONE]: string;
        [PROVIDER_KEY.REGISTRED_ADRESS]: string;
        [PROVIDER_KEY.PRIMARY_ADRESSS]: string;
        [PROVIDER_KEY.OTHER]: string;
        [PROVIDER_KEY.BANK]: string;
        [PROVIDER_KEY.BIK]: string;
        [PROVIDER_KEY.RS]: string;
        [PROVIDER_KEY.KS]: string;
        [PROVIDER_KEY.BANK_ADRESS]: string;
        [PROVIDER_KEY.BANK_OTHER]: string;
    }
}

export enum PROVIDER_KEY {
    ID = 'id',
    NAME = 'name',
    NUMBER = 'number',
    TYPE = 'type',
    FULLNAME = 'fullname',
    SHORTNAME = 'shortname',
    DIRECTOR = 'director',
    POSITION = 'position',
    ACCOUNTANT = 'accountant',
    BASED = 'based',
    INN = 'inn',
    KPP = 'kpp',
    OGRN = 'ogrn',
    OGRNIP = 'ogrnip',
    PERSON_NAME = 'personName',
    DOCUMENT = 'document',
    DOC_SER = 'docSer',
    DOC_NUM = 'docNum',
    DOC_DATE = 'docDate',
    DOC_ISSUED_BY = 'docIssuedBy',
    DOC_DEP_CODE = 'docDepCode',
    EMAIL = 'email',
    GARANT_EMAIL = 'garantEmail',
    PHONE = 'phone',
    ASSIGNED = 'assigned',
    ASSIGNED_PHONE = 'assignedPhone',
    REGISTRED_ADRESS = 'registredAdress',
    PRIMARY_ADRESSS = 'primaryAdresss',
    OTHER = 'other',
    BANK = 'bank',
    BIK = 'bik',
    RS = 'rs',
    KS = 'ks',
    BANK_ADRESS = 'bankAdress',
    BANK_OTHER = 'bankOther'
}