export enum SETUP_ENDPOINT {
  CHECK = 'bitrix_setup/check',
  APP = 'bitrix_setup/app',
  PLACEMENT = 'bitrix_setup/placement'
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
  