import OfferPdfPage from "@/modules/pages/offer-preview/ui/OfferPdfPage";
import { IOffer } from "@/modules/entities/offer";
import { redis } from "@/app/lib/redis/redis";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;
  console.log("param", param);
  const raw = await redis.get(`${param.id}`);
  console.log("raw", raw);

  if (!raw) return notFound();

  const offer = JSON.parse(raw) as IOffer;
  if (!offer) {
    return <div>No offer data found</div>;
  }

  return <OfferPdfPage offer={offer} />;
}
