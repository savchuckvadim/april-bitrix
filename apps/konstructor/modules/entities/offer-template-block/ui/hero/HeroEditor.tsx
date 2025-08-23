import { Input } from "@workspace/ui/components/input";
import Image from "next/image";

import { IOfferBlockHero } from "@/modules/entities/offer-template-block/type/offer-template-block.type";
import { useOfferTemplateBlock } from "@/modules/entities/offer-template-block";
import BlockPositionSelect from "@/modules/feature/position/BlockPositionSelect";
import { useOfferTemplateKonstructor } from "@/modules/entities/offer-template-konstructor/hook/useOfferTemplateKonstructor";
import { BlockPostion } from "@/modules/entities/offer-template-konstructor";
import { ImageUploader } from "../components/ImageUploader";

export const HeroBlockEditor = ({ block }: { block: IOfferBlockHero }) => {
  const { positions } = useOfferTemplateKonstructor();
  const { updateBlock } = useOfferTemplateBlock();

  const onChange = (block: IOfferBlockHero) => {
    updateBlock(block);
  };
  const onPositionChange = (position: BlockPostion) => {
    // const position = positions.find(position => position.id === positionId);

    const newBlock = {
      ...block,
      content: {
        ...block.content,
        slogan: {
          ...block.content.slogan,
          left: position?.left || 0,
          right: position?.right,
          bottom: position?.bottom,
          top: position?.top || 0,
          style:
            position?.style || ("text" as "text" | "border" | "background"),
        },
        subtitle: {
          ...block.content.slogan,
          left: position?.left || 0,
          top: position?.top || 0,
          right: position?.right,
          bottom: position?.bottom,
          style:
            position?.style || ("text" as "text" | "border" | "background"),
        },
      },
    } as IOfferBlockHero;

    updateBlock(newBlock as IOfferBlockHero);
  };
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="relative  h-[37mm]">
          <Image
            src={block.content.image || "/cover/hero.avif"}
            alt="hero image"
            fill
            className="object-cover"
            priority
          />
        </div>

        <ImageUploader
          onUpload={(url) => {
            onChange({ ...block, content: { ...block.content, image: url } });
          }}
        />

        <Input
          className="border p-2 rounded mt-2"
          type="text"
          placeholder="Заголовок"
          value={block.content.slogan.text || ""}
          onChange={(e) =>
            onChange({
              ...block,
              content: {
                ...block.content,
                slogan: { ...block.content.slogan, text: e.target.value },
              },
            })
          }
        />
        <Input
          type="text"
          placeholder="Подзаголовок"
          value={block.content.subtitle.text || ""}
          onChange={(e) =>
            onChange({
              ...block,
              content: {
                ...block.content,
                subtitle: { ...block.content.subtitle, text: e.target.value },
              },
            })
          }
        />

        <BlockPositionSelect
          initialcurrent={{
            bottom: block.content.slogan.bottom,
            top: block.content.slogan.top,
            left: block.content.slogan.left,
            right: block.content.slogan.right,
          }}
          call={onPositionChange}
        />
        {/* <div className="flex flex-col gap-2">
                <Select value={positions[0]?.id.toString() || ''} onValueChange={onPositionChange}>
                    <SelectTrigger >
                        <SelectValue placeholder="Выберите позицию" />
                    </SelectTrigger>
                    <SelectContent>
                        {positions.map((position) => (
                            <SelectItem key={position.id} value={position.id.toString()}>{position.name}</SelectItem>
                        ))}
                    
                    </SelectContent>
                </Select>
            </div> */}
      </div>
    </div>
  );
};
