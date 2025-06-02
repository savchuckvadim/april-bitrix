import Image from "next/image";

const OfferHero = () => {
    return (
        <div className="relative w-full h-[400px]">
            <Image 
                src="/cover/hero.avif" 
                alt="hero image" 
                fill
                className="object-cover"
                priority
            />
        </div>
    );
};

export default OfferHero;

