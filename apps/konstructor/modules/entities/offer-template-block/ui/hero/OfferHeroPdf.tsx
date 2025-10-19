import { IOfferBlockHero } from '@/modules/entities/offer-template-block/type/offer-template-block.type';
import { IOfferTemplate } from '@/modules/entities/offer-template/type/offer-template.type';
import { OfferTemplateDto } from '@workspace/nest-api';
import Image from 'next/image';
import { FC } from 'react';

const OfferHeroPdf: FC<{
    template: OfferTemplateDto;
    block: IOfferBlockHero ;
}> = ({ block, template }) => {
    const { colors  } = template;

    let style = {
        position: 'absolute',
    } as any;
    if (block.content.slogan.top) {
        style = {
            ...style,
            top: block.content.slogan.top,
        };
    }
    if (block.content.slogan.left) {
        style = {
            ...style,
            toleftp: block.content.slogan.left,
        };
    }
    if (block.content.slogan.right) {
        style = {
            ...style,
            right: block.content.slogan.right,
        };
    }
    if (block.content.slogan.bottom) {
        style = {
            ...style,
            bottom: block.content.slogan.bottom,
        };
    }
    return (
        <div className="relative  h-[97mm]">
            <Image
                src={block.content.image || '/cover/hero.avif'}
                alt="hero image"
                fill
                className="object-cover"
                priority
            />
            <div className="max-w-full  m-0 p-4" style={style}>
                {block.content.slogan.text && (
                    <h1
                        className="text-2xl font-bold"
                        style={{
                            color: colors?.accent?.value as string,
                        }}
                    >
                        {block.content.slogan.text}
                    </h1>
                )}
                {block.content.subtitle.text && (
                    <p
                        className="text-sm"
                        style={{
                            color: colors?.accentText?.value as string,
                        }}
                    >
                        {block.content.subtitle.text}
                    </p>
                )}
            </div>
        </div>
    );
};

export default OfferHeroPdf;
