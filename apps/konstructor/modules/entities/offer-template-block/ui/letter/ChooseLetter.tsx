import { IOfferBlockLetter } from "../../type/offer-template-block.type";
import React from "react";
import FormattedText from "./FormattedText";

const ChooseLetter: React.FC<{ block: IOfferBlockLetter }> = ({ block }) => {
  return (
    <div className="overflow-hidden h-full">
      <h2>{block.name}</h2>
      <FormattedText text={block.content.text} />
    </div>
  );
};

export default ChooseLetter;
