"use server";
import { FC } from "react";
import { IOfferBlockLetter } from "../../../type/offer-template-block.type";
import RenderFormattedText from "./RenderFormattedText";
import { IOfferTemplate } from "@/modules/entities/offer-template/type/offer-template.type";

const RenderOfferLetter: FC<{
    block: IOfferBlockLetter;
    template: IOfferTemplate;
}> = ({ block, template }) => {
    const colors = template.colors;
    const backgroundColor = colors.background.value;

    return (
        <div
            className={`flex my-2 p-3`}
            style={{
                backgroundColor: backgroundColor,
                height: `${block.height}mm`,
            }}
        >
            <div className="w-full">
                <RenderFormattedText
                    text={block.content.text}
                    textColor={colors.text.value}
                    redColor={colors.accentText.value}
                    titleColor={colors.accent.value}
                    font={template.font.value}
                />
            </div>
        </div>
    );
};

export default RenderOfferLetter;
