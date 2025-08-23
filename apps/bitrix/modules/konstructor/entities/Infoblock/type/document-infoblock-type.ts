export interface SIBlock {
  //инфоблок с сервера
  id: number;
  name: string;
  title: string;
  code: string;
  groupId: number;
  description: string;
  descriptionForSale: string;
  shortDescription: string;
}

export interface AIBlock {
  // Инфоблок для APP
  id: number;
  checked: boolean;
  name: string;
  title: string;
  code: string;
  groupId: number;
  description: string;
  descriptionForSale: string;
  shortDescription: string;
}

interface SIBlockGroup {
  //инфоблок с сервера
}

interface AIBlockGroup {
  // Инфоблок для APP
}
