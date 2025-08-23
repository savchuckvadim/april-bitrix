export const EOfferBlockType = {
  hero: {
    name: "Заставка",
    code: "hero",
  },
  letter: {
    name: "Сопроводительное Письмо",
    code: "letter",
  },

  documentNumber: {
    name: "Номер Документа",
    code: "documentNumber",
  },
  manager: {
    name: "Менеджер",
    code: "manager",
  },
  logo: {
    name: "Логотип",
    code: "logo",
  },
  stamp: {
    name: "Печать и подпись",
    code: "stamp",
  },
  header: {
    name: "Шапка",
    code: "header",
  },
  footer: {
    name: "Подвал",
    code: "footer",
  },
  infoblocks: {
    name: "Инфоблоки",
    code: "infoblocks",
  },
  price: {
    name: "Цена",
    code: "price",
  },
  slogan: {
    name: "Слоган",
    code: "slogan",
  },
  infoblocksDescription: {
    name: "Инфоблоки",
    code: "infoblocksDescription",
  },
} as const;

export enum EOfferBlockCode {
  HERO = "hero",
  LETTER = "letter",
  DOCUMENT_NUMBER = "documentNumber",
  MANAGER = "manger",
  LOGO = "logo",
  HEADER = "heder",
  FOOTER = "footer",
  INFOBLOCKS = "infoblocks",
  INFOBLOCKS_DESCRIPTION = "infoblocksDescription",
  PRICE = "price",
  SLOGAN = "slogan",
  DEFAULT = "default",
}
export interface IOfferBlocks {
  [EOfferBlockType.hero.code]: IOfferBlockHero;
  [EOfferBlockType.letter.code]: IOfferBlockLetter;
  [EOfferBlockType.documentNumber.code]: IOfferBlockDocumentNumber;
  [EOfferBlockType.manager.code]: IOfferBlockManager;
  [EOfferBlockType.logo.code]: IOfferBlockLogo;
  [EOfferBlockType.stamp.code]: IOfferBlockStamp;
  [EOfferBlockType.header.code]: IOfferBlockHeader;
  [EOfferBlockType.footer.code]: IOfferBlockFooter;
  [EOfferBlockType.infoblocks.code]: IOfferBlockInfoblocks;
  [EOfferBlockType.price.code]: IOfferBlockPrice;
  [EOfferBlockType.slogan.code]: IOfferBlockSlogan;
  [EOfferBlockType.infoblocksDescription
    .code]: IOfferBlockInfoblocksDescription;
}

export interface IOfferBlockHero {
  id: string;
  type: typeof EOfferBlockType.hero.code;
  name: typeof EOfferBlockType.hero.name;
  order: number;
  content: IOfferBlockHeroContent;
  height: 97 | number;

  position: "relative" | "absolute";
}

export interface IOfferBlockHeroContent {
  image: string;

  slogan: {
    text: string;
    position: "relative" | "absolute";
    left: number;
    top: number;
    right: number;
    bottom: number;
    isActive: boolean;
    style: "text" | "border" | "background";
  };
  subtitle: {
    text: string;
    position: "relative" | "absolute";
    left: number;
    top: number;
    right: number;
    bottom: number;
    isActive: true;
    style: "text" | "border" | "background";
  };
}
export interface IOfferBlockLetter {
  id: string;
  type: typeof EOfferBlockType.letter.code;
  name: typeof EOfferBlockType.letter.name;
  order: 2;
  content: {
    text: string;
    appeal: string;
    withAppeal: boolean;
  };
  height: number;

  position: "relative";
}

export interface IOfferBlockDocumentNumber {
  id: string;
  type: typeof EOfferBlockType.documentNumber.code;
  name: typeof EOfferBlockType.documentNumber.name;
  order: 4;
  content: {
    number: string;
    appeal: string;
    company: string;
    manager: string;
    email: string;
    inn: string;
  };
  height: 20;
  data: {};
  position: "relative";
}

export interface IOfferBlockManager {
  id: string;
  type: typeof EOfferBlockType.manager.code;
  name: typeof EOfferBlockType.manager.name;
  order: 5;
  content: {
    name: string;
    position: string;
    phone: string;
    email: string;
  };
  height: 20;

  position: "relative";
}

export interface IOfferBlockStamp {
  id: string;
  type: typeof EOfferBlockType.stamp.code;
  name: typeof EOfferBlockType.stamp.name;
  order: 7 | number;
  content: {
    stamp: string;
    signature: string;
    director: string;
    directorPosition: string;
    company: string;
    email: string;
    inn: string;
    position: "relative" | "absolute";
    left: number;
    top: number;
  };
  height: 5 | number;
  data: {};
  position: "relative";
}

export interface IOfferBlockHeader {
  id: string;
  type: typeof EOfferBlockType.header.code;
  name: typeof EOfferBlockType.header.name;
  order: 8;
  content: {
    mode: "doubleRq" | "logoRq";
    rq: {
      name: string;
      inn: string;
      address: string;
      email: string;
    };
    logo: {
      image: string;
    };
  };
  position: "relative";
  left: number;
  top: number;
  height: number;
}

export interface IOfferBlockFooter {
  id: string;
  type: typeof EOfferBlockType.footer.code;
  name: typeof EOfferBlockType.footer.name;
  order: 9;
  content: {
    mode: "manager" | "company" | "image" | "empty";
    manager: {
      name: string;
      position: string;
      phone: string;
      email: string;
    };
    company: {
      name: string;
      inn: string;
      address: string;
      email: string;
    };
    image: {
      image: string;
      position: "relative" | "absolute";
      left: number;
      top: number;
    };
    left: "manager" | "company" | "image" | "empty";
    right: "manager" | "company" | "image" | "empty";
  };
  data: {};
  height: number;
  position: "absolute" | "relative";
  bottom: number;
  left: number;
}
export interface IOfferBlockLogo {
  id: string;
  type: typeof EOfferBlockType.logo.code;
  name: typeof EOfferBlockType.logo.name;
  order: 6;
  content: {
    image: string;
    position: "relative" | "absolute";
    left: number;
    top: number;
  };
  position: "relative" | "absolute";
  left: number;
  top: number;
  height: 5;
}
export interface IOfferBlockInfoblocks {
  id: string;
  type: typeof EOfferBlockType.infoblocks.code;
  name: typeof EOfferBlockType.infoblocks.name;
  order: 10;
  height: 0;
  content: {
    mode: "list" | "table" | "square";
    withTitle: boolean;
    infoblocks: string[];
  };
}

export interface IOfferBlockInfoblocksDescription {
  id: string;
  type: typeof EOfferBlockType.infoblocksDescription.code;
  name: typeof EOfferBlockType.infoblocksDescription.name;
  order: 10;
  height: 0;
  content: {
    mode: "list" | "table" | "square";
    description: "none" | "small" | "medium" | "big";
    withTitle: boolean;
    infoblocks: string[];
  };
}

export interface IOfferBlockPrice {
  id: string;
  type: typeof EOfferBlockType.price.code;
  name: typeof EOfferBlockType.price.name;
  height: number;
  order: 11;
  content: {
    visual: "list" | "table";
    mode: "invoice" | "budget" | "commers";
    dicsount: boolean;
    default: boolean;
    defaultMonth: boolean;

    total: {
      word: string;
      color: string;
    }[];
    withTitle: boolean;
    cells: {
      name: string;
      quantity: string;
      price: string;
      total: string;
    }[];
    position: "relative" | "absolute";
    left: number;
    top: number;
    height: number;
  };
}

export interface IOfferBlockSlogan {
  id: string;
  pageId: string;
  type: typeof EOfferBlockType.slogan.code;
  name: typeof EOfferBlockType.slogan.name;
  order: 12;
  height: 0;
  content: {
    text: string;
    position: "absolute";
    left: number;
    top: number;
    textColor: string;
    backgroundColor: string;

    borderWidth: number;
    borderRadius: number;
    borderStyle:
      | "solid"
      | "dashed"
      | "dotted"
      | "double"
      | "groove"
      | "ridge"
      | "inset"
      | "outset";
    borderColor: string;
  };
}

export type IOfferBlock<T extends keyof typeof EOfferBlockType> =
  T extends "hero"
    ? IOfferBlockHero
    : T extends "letter"
      ? IOfferBlockLetter
      : T extends "documentNumber"
        ? IOfferBlockDocumentNumber
        : T extends "manager"
          ? IOfferBlockManager
          : T extends "logo"
            ? IOfferBlockLogo
            : T extends "stamp"
              ? IOfferBlockStamp
              : T extends "header"
                ? IOfferBlockHeader
                : T extends "footer"
                  ? IOfferBlockFooter
                  : T extends "infoblocks"
                    ? IOfferBlockInfoblocks
                    : T extends "price"
                      ? IOfferBlockPrice
                      : T extends "slogan"
                        ? IOfferBlockSlogan
                        : T extends "infoblocksDescription"
                          ? IOfferBlockInfoblocksDescription
                          : never;

export type IOfferTemplateBlock = {
  [K in keyof typeof EOfferBlockType]: IOfferBlock<K>;
}[keyof typeof EOfferBlockType];

//
//     type BlockCode = typeof EOfferBlockType[keyof typeof EOfferBlockType]['code'];

// type BlockType<T extends BlockCode> = T extends 'hero'
//     ? IOfferBlockHero
//     : T extends 'letter'
//     ? IOfferBlockLetter
//     : T extends 'documentNumber'
//     ? IOfferBlockDocumentNumber
//     : T extends 'manager'
//     ? IOfferBlockManager
//     : T extends 'logo'
//     ? IOfferBlockLogo
//     : T extends 'stamp'
//     ? IOfferBlockStamp
//     : T extends 'header'
//     ? IOfferBlockHeader
//     : T extends 'footer'
//     ? IOfferBlockFooter
//     : T extends 'infoblocks'
//     ? IOfferBlockInfoblocks
//     : T extends 'price'
//     ? IOfferBlockPrice
//     : T extends 'slogan'
//     ? IOfferBlockSlogan
//     : never;

// export const getBlock = <T extends BlockCode>(code: T): BlockType<T> => {
//     return blocksData[code] as unknown as BlockType<T>;
// };

// // Примеры использования с правильным выводом типов:
// const heroBlock = getBlock('hero');        // тип будет с полным интерфейсом hero блока
// const letterBlock = getBlock('letter');    // тип будет с полным интерфейсом letter блока

// export const blocks = heroBlock;           // экспортируем с правильным типом
// blocks.content

// type Data = {name:'date'}
// type Car = {name:'car'}

// type Test<T> = T extends 'data' ? Data : Car;

// const test: Test<'data'> = {name:'date'}
// const test2: Test<'car'> = {name:'car'}
