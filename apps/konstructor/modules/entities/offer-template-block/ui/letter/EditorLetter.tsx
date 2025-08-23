import { IOfferBlockLetter } from "../../type/offer-template-block.type";
import { useOfferTemplateBlock } from "../../hook/useOfferTemplateBlock";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { estimateHeightMm } from "../../lib/text-height.util";

export const LetterBlockEditor = ({ block }: { block: IOfferBlockLetter }) => {
  const { updateBlock } = useOfferTemplateBlock();

  const onChange = (value: string) => {
    const updatedHieght = estimateHeightMm(value);
    const newBlock = {
      ...block,
      content: { ...block.content, text: value },
      height: updatedHieght,
    };
    updateBlock(newBlock);
  };
  debugger;
  return (
    <div>
      <div className="flex flex-col gap-2">
        <Textarea
          className="border p-2 rounded mt-2"
          placeholder="Текст сопроводительного письма"
          value={block.content.text || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
