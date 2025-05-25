export enum SETUP_ENDPOINT {
  CHECK = 'bitrix-setup/check',
  APP = 'bitrix-setup/app',
  PLACEMENT = 'bitrix-setup/placement'
}
export enum ONLINE_KONSTRUCTOR_ENDPOINTS {
  COMPLECTS = 'garant/complects',
  INFOBLOCKS = 'garant/infoblocks',
  PRICES = 'prices',
  SUPPLIES = 'supplies',
  REGIONS = 'regions',
  CONSULTING = 'consulting',
}


export interface BitrixAppToken {
    client_id: string;
    client_secret: string;
    access_token: string;
    refresh_token: string;
    expires_at: string; // ISO string
    application_token?: string;
    member_id?: string;
  }
  
  export interface BitrixAppPlacement {
    code: string;
    type: string;
    group: string;
    status: string;
    bitrix_heandler: string;
    public_heandler: string;
    bitrix_codes: string;
  }
  
  export interface BitrixAppPayload {
    domain: string;
    code: string;
    group: string;
    type: string;
    status: string;
    token: BitrixAppToken;
  }
  
  export interface BitrixAppPlacementPayload {
    domain: string;
    code: string;
    placements: BitrixAppPlacement[];
  }
  