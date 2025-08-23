"use client";
import React from "react";
import OfferHero from "@/modules/entities/offer-template-block/ui/hero/OfferHero";
import Image from "next/image";
import {
  IOfferTemplateBlock,
  useOfferTemplateBlock,
} from "@/modules/entities/offer-template-block";
import OfferLetter from "@/modules/entities/offer-template-block/ui/letter/OfferLetter";
import { EOfferBlockType } from "@/modules/entities/offer-template-block/type/offer-template-block.type";
import { TemplatePrice } from "@/modules/entities/offer-template-block/ui/price/TemplatePrice";

export const BlockRenderer: React.FC<{ block: IOfferTemplateBlock }> = ({
  block,
}) => {
  const BlockWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <div
        className={`w-full `}
        style={{
          height: block.height ? `${block.height}mm` : "100px",
        }}
      >
        <div className="relative">{children}</div>
      </div>
    );
  };
  const { editeble } = useOfferTemplateBlock();

  switch (block.type) {
    case "hero":
      const isSelected =
        editeble && editeble.id === block.id && editeble.type === block.type;
      return (
        <BlockWrapper>
          <OfferHero block={isSelected ? editeble : block} />
        </BlockWrapper>
      );
    case "header":
      return (
        <BlockWrapper>
          {/* <h1 className="text-3xl font-bold my-4">{block.name}</h1> */}
          <div className={`flex flex-row justify-between text-xs  p-2`}>
            <div className="text-left ">
              <p>{block.content.rq.name}</p>
              <p>{block.content.rq.inn}</p>
              <p>{block.content.rq.address}</p>
              <p>{block.content.rq.email}</p>
            </div>
            <div className="text-right">
              {/* <img src={block.content.logo.image} alt="logo" className='w-10 h-10' /> */}
              <Image
                src={block.content.logo.image}
                alt="logo"
                width={100}
                height={100}
                className="object-contain"
              />
            </div>
          </div>
        </BlockWrapper>
      );

    case "logo":
      return <img src={block.content.image} alt="" className="my-2" />;
    case "letter":
      return <OfferLetter block={block} inOffer={false} />;

    case "documentNumber":
      return (
        <div
          className={`flex flex-row justify-between text-xs mt-10  p-2`}
          style={{
            height: `${block.height}mm`,
          }}
        >
          <div className="text-left flex flex-col justify-center  ">
            <p>№ {block.content.number}</p>
          </div>
          <div className="text-right flex flex-col justify-center">
            <p>{block.content.appeal}</p>
            <p>{block.content.company}</p>
          </div>
        </div>
      );
    case EOfferBlockType.manager.code:
      return (
        <BlockWrapper>
          <div className="flex flex-row justify-between text-xs h-full p-2">
            <div className="text-left ">
              <p>{block.content.name}</p>
              <p>{block.content.position}</p>
              <p>{block.content.phone}</p>
              <p>{block.content.email}</p>
            </div>
          </div>
        </BlockWrapper>
      );
    case EOfferBlockType.price.code:
      return (
        <BlockWrapper>
          <TemplatePrice />
        </BlockWrapper>
      );
    case "footer":
      return (
        <footer
          className={`${block.position === "absolute" ? "absolute" : ""} p-2 bottom-0 left-0 right-0 text-sm text-center h-[${block.height}mm]`}
        >
          <h2>{block.name}</h2>
          <div className="flex flex-row justify-between text-xs h-full">
            <div className="text-left ">
              <p>Директор по Продажам</p>
              <p>Иванов Пётр Петрович</p>
              <p>+7 (999) 999-99-99</p>
            </div>
            <div className="text-right">
              <p>ООО Партнер</p>
              <p>Ваш партнер в сфере права</p>
              <p>info@garant.ru</p>
            </div>
          </div>
        </footer>
      );
    default:
      return null;
  }
};
