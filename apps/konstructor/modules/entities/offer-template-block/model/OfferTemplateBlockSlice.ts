import {
  EOfferBlockType,
  IOfferBlocks,
  IOfferBlockHero,
  IOfferBlockLetter,
  IOfferBlockDocumentNumber,
  IOfferBlockManager,
  IOfferBlockLogo,
  IOfferBlockStamp,
  IOfferBlockHeader,
  IOfferBlockFooter,
  IOfferBlockInfoblocks,
  IOfferBlockPrice,
  IOfferBlockSlogan,
  IOfferBlock,
  IOfferTemplateBlock,
} from "../type/offer-template-block.type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { estimateHeightMm } from "../lib/text-height.util";
import { fakeText } from "../../offer-template-konstructor/ui/components/blocks-choose-menu/BlockChooseItem";
export type OfferBlockState = typeof initialState;
const blocksData = {
  [EOfferBlockType.hero.code]: {
    id: "0",
    type: EOfferBlockType.hero.code,
    name: EOfferBlockType.hero.name,
    order: 0,
    content: {
      image: "/cover/hero.avif",
      slogan: {
        text: "Сделайте первый шаг к успеху",
        position: "relative",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isActive: true,
        style: "text",
      },
      subtitle: {
        text: "Сделайте первый шаг к успеху",
        position: "relative",
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isActive: true,
        style: "text",
      },
    },
    height: 97,
    exclusive: ["bigLetter"],
    data: {},
    position: "relative",
  } as IOfferBlockHero,
  [EOfferBlockType.letter.code]: {
    id: "1",
    type: EOfferBlockType.letter.code,
    name: EOfferBlockType.letter.name,
    order: 2,
    content: {
      text: fakeText,
      appeal: "Уважаемый",
      withAppeal: true,
    },
    height: 50 as number,
    data: {},
    exclusive: ["bigLetter"],
    position: "relative",
  } as IOfferBlockLetter,
  [EOfferBlockType.documentNumber.code]: {
    id: "3" as string,
    type: EOfferBlockType.documentNumber.code,
    name: EOfferBlockType.documentNumber.name,
    order: 4,
    content: {
      number: "№34 от 12.03.2025",
      appeal: "Директору",
      company: 'ЗАО "Конструктор"',
      manager: "Иванов Пётр Петрович",
      email: "info@garant.ru",
      inn: "1234567890",
    },
    height: 20,
    data: {},
    position: "relative" as const,
  } as IOfferBlockDocumentNumber,
  [EOfferBlockType.manager.code]: {
    id: "4" as string,
    type: EOfferBlockType.manager.code,
    name: EOfferBlockType.manager.name,
    order: 5,
    content: {
      name: "Иванов Пётр Петрович",
      position: "Директор по Продажам",
      phone: "+7 (999) 999-99-99",
      email: "info@garant.ru",
    },
    height: 20 as const,
    data: {},
    position: "relative" as const,
  } as IOfferBlockManager,
  [EOfferBlockType.logo.code]: {
    id: "5" as string,
    type: EOfferBlockType.logo.code,
    name: EOfferBlockType.logo.name,
    order: 6,
    content: {
      image: "/logo/garant.png",
      position: "relative" as "relative" | "absolute",
      left: 0,
      top: 0,
    },
    position: "relative" as "relative" | "absolute",
    left: 0,
    top: 0,
    height: 5 as const,
    data: {},
  } as IOfferBlockLogo,
  [EOfferBlockType.stamp.code]: {
    id: "6" as string,
    type: EOfferBlockType.stamp.code,
    name: EOfferBlockType.stamp.name,
    order: 7,
    content: {
      stamp: "/stamp/stamp.png",
      signature: "/stamp/signature.png",
      director: "Иванов Пётр Петрович",
      directorPosition: "Директор по Продажам",
      company: 'ЗАО "Конструктор"',
      email: "info@garant.ru",
      inn: "1234567890",
      position: "relative" as "relative" | "absolute",
      left: 0,
      top: 0,
    },
    height: 5 as const,
    data: {},
    position: "relative" as const,
  } as IOfferBlockStamp,
  [EOfferBlockType.header.code]: {
    id: "7" as string,
    type: EOfferBlockType.header.code,
    name: EOfferBlockType.header.name,
    order: 8,
    content: {
      mode: "doubleRq" as "doubleRq" | "logoRq",
      rq: {
        name: "ООО Партнер",
        inn: "1234567890",
        address: "Санкт-Петербург, пр. Гагарина 73",
        email: "info@garant.ru",
      },
      logo: {
        image: "/logo/garant.png",
      },
    },
    position: "relative" as "relative",
    left: 0,
    top: 0,
    height: 25 as const,
  } as IOfferBlockHeader,
  [EOfferBlockType.footer.code]: {
    id: "8" as string,
    type: EOfferBlockType.footer.code,
    name: EOfferBlockType.footer.name,
    order: 9,
    content: {
      mode: "manager" as "manager" | "company" | "image" | "empty",
      manager: {
        name: "Иванов Пётр Петрович" as string,
        position: "Директор по Продажам" as string,
        phone: "+7 (999) 999-99-99" as string,
        email: "info@garant.ru" as string,
      },
      company: {
        name: "ООО Партнер" as string,
        inn: "1234567890" as string,
        address: "Санкт-Петербург, пр. Гагарина 73" as string,
        email: "info@garant.ru" as string,
      },
      image: {
        image: "/logo/garant.png" as string,
        position: "relative" as "relative" | "absolute",
        left: 0 as number,
        top: 0 as number,
      },
      left: "manager" as "manager" | "company" | "image" | "empty",
      right: "company" as "manager" | "company" | "image" | "empty",
    },
    data: {},
    height: 25 as const,
    position: "absolute" as "relative" | "absolute",
    bottom: 0,
    left: 0,
  } as IOfferBlockFooter,
  [EOfferBlockType.infoblocks.code]: {
    id: "9" as string,
    type: EOfferBlockType.infoblocks.code,
    name: EOfferBlockType.infoblocks.name,
    order: 10,
    height: 0,
    content: {
      mode: "list" as "list" | "table" | "square",
      withTitle: true,
      infoblocks: [],
    },
  } as IOfferBlockInfoblocks,
  [EOfferBlockType.price.code]: {
    id: "10" as string,
    type: EOfferBlockType.price.code,
    name: EOfferBlockType.price.name,
    order: 11,
    height: 50,
    position: "relative" as "relative" | "absolute",

    content: {
      visual: "list" as "list" | "table",
      mode: "invoice" as "invoice" | "budget" | "commers",
      dicsount: false,
      default: true,
      defaultMonth: false,
      total: [],
      withTitle: true,
      cells: [
        {
          name: "Гарант Юрист",
          price: "1000",
          quantity: "1",
          total: "1000",
        },
        {
          name: "Гарант Максимум",
          price: "100000",
          quantity: "1",
          total: "100000",
        },
        {
          name: "Гарант Legal Tech",
          price: "3700",
          quantity: "1",
          total: "3700",
        },
        {
          name: "Гарант Искра",
          price: "25000",
          quantity: "1",
          total: "25000",
        },
      ],
      position: "relative" as "relative" | "absolute",
      left: 0,
      top: 0,
      height: 5,
    },
  } as IOfferBlockPrice,
  [EOfferBlockType.slogan.code]: {
    id: "11",
    type: EOfferBlockType.slogan.code,
    name: EOfferBlockType.slogan.name,
    order: 12,
    height: 0,
    pageId: "",
    content: {
      text: "",
      position: "absolute",
      left: 0,
      top: 0,
      textColor: "",
      backgroundColor: "",
      borderWidth: 0,
      borderRadius: 0,
      borderStyle: "solid",
      borderColor: "",
    },
  } as IOfferBlockSlogan,
} as IOfferBlocks;

const initialState = {
  default: blocksData as IOfferBlocks,
  editeble: null as IOfferTemplateBlock | null,
};

export const offerTemplateBlockSlice = createSlice({
  name: "offerTemplateBlock",
  initialState,
  reducers: {
    initDefaultLetter: (
      state: OfferBlockState,
      action: PayloadAction<{ text: string }>,
    ) => {
      const text = action.payload.text;
      const height = estimateHeightMm(text);
      state.default[EOfferBlockType.letter.code].content.text = text;
      state.default[EOfferBlockType.letter.code].height = height;
    },
    changeLetterBlock: (
      state: OfferBlockState,
      action: PayloadAction<{ text: string; height: number }>,
    ) => {
      const text = action.payload.text;
      const height = action.payload.height;
      state.default[EOfferBlockType.letter.code].content.text = text;

      if (!height) return;

      console.log(height, "redux.height");
      state.default[EOfferBlockType.letter.code].height = height;
    },
    setEditeble: (
      state: OfferBlockState,
      action: PayloadAction<IOfferTemplateBlock>,
    ) => {
      state.editeble = action.payload;
    },
    editBlock: (
      state: OfferBlockState,
      action: PayloadAction<IOfferTemplateBlock>,
    ) => {
      state.editeble = action.payload;
    },

    deleteEditeble: (state: OfferBlockState) => {
      state.editeble = null;
    },
  },
});

export const {
  setEditeble,
  editBlock,
  deleteEditeble,
  changeLetterBlock,
  initDefaultLetter,
} = offerTemplateBlockSlice.actions;
export const offerTemplateBlockReducer = offerTemplateBlockSlice.reducer;
