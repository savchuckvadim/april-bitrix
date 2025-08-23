"use client";
import { useOfferTemplateKonstructor } from "@/modules/entities/offer-template-konstructor";
import OfferTemplateKonstructor from "@/modules/entities/offer-template-konstructor/ui/OfferTemplateKonstructor";
import { Button } from "@workspace/ui/components/button";
import { Link } from "lucide-react";
import { Suspense } from "react";

const OfferTemplateKonstructorPage = () => {
  const { saveTemplate } = useOfferTemplateKonstructor();
  return (
    <div className="flex flex-col h-screen overflow-auto">
      <div className="p-4 h-15 bg-gray-200">
        <div className="flex gap-2">
          {/* <Link href="/offer/preview"> */}
          <Button onClick={saveTemplate}>Сохранить</Button>

          {/* </Link> */}
          {/* 
                <Link href="/offer/preview">

                    <Button>
                        Сохранить как новый
                    </Button>
                </Link> */}
        </div>
      </div>
      <OfferTemplateKonstructor />
    </div>
  );
};

function LazyWrapper() {
  return (
    <Suspense fallback={<div>Загрузка предпросмотра...</div>}>
      <OfferTemplateKonstructorPage />
    </Suspense>
  );
}

export default LazyWrapper;
