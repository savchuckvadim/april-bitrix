import { usePdfTemplateSettings } from "@/modules/feature/offer-pdf-settings";
import Image from "next/image";
import { FC } from "react";

const OfferHero: FC<{
    img: string,
    title?: string,
    subtitle?: string
}> = ({ img, title, subtitle }) => {
    const { colors } = usePdfTemplateSettings();
    return (
        <div className="relative  h-[97mm]">
            <Image
                src={img || "/cover/hero.avif"}
                alt="hero image"
                fill
                className="object-cover"
                priority
            />
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {title && <h1 className="text-2xl font-bold"
                    style={{
                        color: colors.accent.value
                    }}
                >{title}</h1>}
                {subtitle && <p className="text-sm"
                    style={{
                        color: colors.accentText.value
                    }}
                >{subtitle}</p>}
            </div>
        </div>
    );
};

export default OfferHero;

